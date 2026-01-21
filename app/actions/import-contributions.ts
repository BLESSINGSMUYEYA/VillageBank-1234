'use server'

import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export type ImportPreviewRow = {
    rowNumber: number;
    email: string;
    amount: number;
    date: string; // YYYY-MM-DD
    month: number;
    year: number;
    status: 'VALID' | 'ERROR';
    error?: string;
    userName?: string;
    userId?: string;
};

export type ImportResult = {
    success: boolean;
    preview?: ImportPreviewRow[];
    summary?: {
        total: number;
        valid: number;
        errors: number;
    };
    error?: string;
};

export async function parseAndValidateImport(
    formData: FormData,
    groupId: string
): Promise<ImportResult> {
    try {
        const session = await getSession();
        const userId = session?.userId;
        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse to JSON directly. Assume headers: Email, Amount, Date (YYYY-MM-DD or Excel date)
        const rawData = XLSX.utils.sheet_to_json<any>(sheet, { raw: false, dateNF: 'yyyy-mm-dd' });

        if (rawData.length === 0) {
            return { success: false, error: 'Sheet is empty' };
        }

        // Fetch all group members to map emails
        const groupMembers = await prisma.groupMember.findMany({
            where: { groupId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        const emailMap = new Map<string, typeof groupMembers[0]>();
        groupMembers.forEach((member) => {
            if (member.user.email) {
                emailMap.set(member.user.email.toLowerCase().trim(), member);
            }
        });

        const preview: ImportPreviewRow[] = [];
        let validCount = 0;
        let errorCount = 0;

        rawData.forEach((row, index) => {
            // Row number in excel (1-based, +1 for header)
            const rowNumber = index + 2;
            const email = typeof row.Email === 'string' ? row.Email.toLowerCase().trim() : '';
            const amountStr = String(row.Amount || '0').replace(/[^0-9.]/g, '');
            const amount = parseFloat(amountStr);
            let dateStr = row.Date;

            const item: ImportPreviewRow = {
                rowNumber,
                email: row.Email || '',
                amount: isNaN(amount) ? 0 : amount,
                date: '',
                month: 0,
                year: 0,
                status: 'VALID',
            };

            // Validation 1: User exists
            const member = emailMap.get(email);
            if (!member) {
                item.status = 'ERROR';
                item.error = 'User not found in group';
            } else {
                item.userName = `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim();
                item.userId = member.user.id;
            }

            // Validation 2: Amount
            if (isNaN(amount) || amount <= 0) {
                item.status = 'ERROR';
                item.error = item.error ? `${item.error}, Invalid amount` : 'Invalid amount';
            }

            // Validation 3: Date
            // Try to parse date. Expecting string or excel serial date if we hadn't used {raw: false}
            // With {raw: false}, it attempts to format, but 'Date' column might be tricky. 
            // Let's assume input is YYYY-MM-DD or standard formats.
            const dateObj = new Date(dateStr);
            if (isNaN(dateObj.getTime())) {
                item.status = 'ERROR';
                item.error = item.error ? `${item.error}, Invalid date` : 'Invalid date';
            } else {
                item.date = dateObj.toISOString().split('T')[0];
                item.month = dateObj.getMonth() + 1; // 1-12
                item.year = dateObj.getFullYear();
            }

            if (item.status === 'VALID') validCount++;
            else errorCount++;

            preview.push(item);
        });

        return {
            success: true,
            preview,
            summary: {
                total: rawData.length,
                valid: validCount,
                errors: errorCount,
            },
        };

    } catch (error) {
        console.error('Import parse error:', error);
        return { success: false, error: 'Failed to parse file' };
    }
}

export async function commitImport(
    data: ImportPreviewRow[],
    groupId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
        const session = await getSession();
        const userId = session?.userId;
        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Filter only valid rows
        const validRows = data.filter((row) => row.status === 'VALID' && row.userId);

        if (validRows.length === 0) {
            return { success: false, error: 'No valid rows to import' };
        }

        // Use transaction for safety
        await prisma.$transaction(
            validRows.map((row) =>
                prisma.contribution.create({
                    data: {
                        groupId,
                        userId: row.userId!,
                        amount: row.amount,
                        month: row.month,
                        year: row.year,
                        paymentDate: new Date(row.date),
                        status: 'COMPLETED', // Use COMPLETED for imported historical data? Or PENDING? Usually historical is done.
                        paymentMethod: 'IMPORT',
                    },
                })
            )
        );

        revalidatePath(`/groups/${groupId}`);
        return { success: true, count: validRows.length };

    } catch (error) {
        console.error('Import commit error:', error);
        return { success: false, error: 'Failed to save records' };
    }
}
