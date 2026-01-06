import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { validatePhoneNumber } from '@/lib/payments'

const updateBankDetailSchema = z.object({
    type: z.enum(['AIRTEL_MONEY', 'MPAMBA', 'BANK_CARD']).optional(),
    accountNumber: z.string().min(8, 'Account number must be at least 8 characters').optional(),
    accountName: z.string().min(2, 'Account name must be at least 2 characters').optional(),
    bankName: z.string().optional(),
    isPrimary: z.boolean().optional(),
})

// PUT - Update existing bank detail or set as primary
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        const userId = session?.userId

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await params
        const body = await request.json()
        const validatedData = updateBankDetailSchema.parse(body)

        // Check if bank detail exists and belongs to user
        const existingDetail = await prisma.memberBankDetail.findFirst({
            where: { id, userId: userId as string },
        })

        if (!existingDetail) {
            return NextResponse.json(
                { error: 'Bank detail not found' },
                { status: 404 }
            )
        }

        const typeToValidate = validatedData.type || existingDetail.type
        const accountNumberToValidate = validatedData.accountNumber || existingDetail.accountNumber

        // Validate phone number for mobile money types
        if ((typeToValidate === 'AIRTEL_MONEY' || typeToValidate === 'MPAMBA') && validatedData.accountNumber) {
            if (!validatePhoneNumber(accountNumberToValidate, typeToValidate)) {
                return NextResponse.json(
                    { error: `Invalid phone number format for ${typeToValidate === 'AIRTEL_MONEY' ? 'Airtel Money' : 'Mpamba'}` },
                    { status: 400 }
                )
            }
        }

        // If setting as primary, unset any existing primary
        if (validatedData.isPrimary) {
            await prisma.memberBankDetail.updateMany({
                where: { userId: userId as string, isPrimary: true, NOT: { id } },
                data: { isPrimary: false },
            })
        }

        const updatedDetail = await prisma.memberBankDetail.update({
            where: { id },
            data: {
                ...(validatedData.type && { type: validatedData.type }),
                ...(validatedData.accountNumber && { accountNumber: validatedData.accountNumber }),
                ...(validatedData.accountName && { accountName: validatedData.accountName }),
                ...(validatedData.bankName !== undefined && { bankName: validatedData.bankName }),
                ...(validatedData.isPrimary !== undefined && { isPrimary: validatedData.isPrimary }),
            },
        })

        return NextResponse.json({
            message: 'Bank detail updated successfully',
            bankDetail: updatedDetail,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            )
        }

        console.error('Update bank detail error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE - Remove a bank detail
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        const userId = session?.userId

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await params

        // Check if bank detail exists and belongs to user
        const existingDetail = await prisma.memberBankDetail.findFirst({
            where: { id, userId: userId as string },
        })

        if (!existingDetail) {
            return NextResponse.json(
                { error: 'Bank detail not found' },
                { status: 404 }
            )
        }

        await prisma.memberBankDetail.delete({
            where: { id },
        })

        // If deleted was primary, set another as primary
        if (existingDetail.isPrimary) {
            const remainingDetail = await prisma.memberBankDetail.findFirst({
                where: { userId: userId as string },
                orderBy: { createdAt: 'desc' },
            })

            if (remainingDetail) {
                await prisma.memberBankDetail.update({
                    where: { id: remainingDetail.id },
                    data: { isPrimary: true },
                })
            }
        }

        return NextResponse.json({
            message: 'Bank detail deleted successfully',
        })
    } catch (error) {
        console.error('Delete bank detail error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
