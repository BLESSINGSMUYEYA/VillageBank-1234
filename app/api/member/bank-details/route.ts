import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { validatePhoneNumber } from '@/lib/payments'

const createBankDetailSchema = z.object({
    type: z.enum(['AIRTEL_MONEY', 'MPAMBA', 'BANK_CARD']),
    accountNumber: z.string().min(8, 'Account number must be at least 8 characters'),
    accountName: z.string().min(2, 'Account name must be at least 2 characters'),
    bankName: z.string().optional(),
    isPrimary: z.boolean().optional().default(false),
})

// GET - Fetch current user's saved payment methods
export async function GET() {
    try {
        const session = await getSession()
        const userId = session?.userId

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const bankDetails = await prisma.memberBankDetail.findMany({
            where: { userId: userId as string },
            orderBy: [
                { isPrimary: 'desc' },
                { createdAt: 'desc' }
            ],
        })

        return NextResponse.json({ bankDetails })
    } catch (error) {
        console.error('Get bank details error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Add new bank detail
export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        const userId = session?.userId

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validatedData = createBankDetailSchema.parse(body)

        // Validate phone number for mobile money types
        if (validatedData.type === 'AIRTEL_MONEY' || validatedData.type === 'MPAMBA') {
            if (!validatePhoneNumber(validatedData.accountNumber, validatedData.type)) {
                return NextResponse.json(
                    { error: `Invalid phone number format for ${validatedData.type === 'AIRTEL_MONEY' ? 'Airtel Money' : 'Mpamba'}` },
                    { status: 400 }
                )
            }
        }

        // Require bank name for bank accounts
        if (validatedData.type === 'BANK_CARD' && !validatedData.bankName) {
            return NextResponse.json(
                { error: 'Bank name is required for bank accounts' },
                { status: 400 }
            )
        }

        // If setting as primary, unset any existing primary
        if (validatedData.isPrimary) {
            await prisma.memberBankDetail.updateMany({
                where: { userId: userId as string, isPrimary: true },
                data: { isPrimary: false },
            })
        }

        // Check if this is the first bank detail - make it primary by default
        const existingCount = await prisma.memberBankDetail.count({
            where: { userId: userId as string },
        })

        const bankDetail = await prisma.memberBankDetail.create({
            data: {
                userId: userId as string,
                type: validatedData.type,
                accountNumber: validatedData.accountNumber,
                accountName: validatedData.accountName,
                bankName: validatedData.bankName,
                isPrimary: validatedData.isPrimary || existingCount === 0,
            },
        })

        return NextResponse.json({
            message: 'Bank detail added successfully',
            bankDetail,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            )
        }

        console.error('Create bank detail error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
