import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { validatePhoneNumber } from '@/lib/payments'

const updatePaymentMethodSchema = z.object({
    type: z.enum(['AIRTEL_MONEY', 'MPAMBA', 'BANK_CARD']).optional(),
    accountNumber: z.string().min(8, 'Account number must be at least 8 characters').optional(),
    accountName: z.string().min(2, 'Account name must be at least 2 characters').optional(),
    isActive: z.boolean().optional(),
})

// PUT - Update payment method (Treasurer/Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; methodId: string }> }
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

        const { id: groupId, methodId } = await params
        const body = await request.json()
        const validatedData = updatePaymentMethodSchema.parse(body)

        // Check if user is admin or treasurer of the group
        const membership = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: userId as string,
                status: 'ACTIVE',
                role: { in: ['ADMIN', 'TREASURER'] },
            },
        })

        if (!membership) {
            return NextResponse.json(
                { error: 'Only group admins or treasurers can update payment methods' },
                { status: 403 }
            )
        }

        // Check if payment method exists and belongs to group
        const existingMethod = await prisma.paymentMethod.findFirst({
            where: { id: methodId, groupId },
        })

        if (!existingMethod) {
            return NextResponse.json(
                { error: 'Payment method not found' },
                { status: 404 }
            )
        }

        const typeToValidate = validatedData.type || existingMethod.type
        const accountNumberToValidate = validatedData.accountNumber || existingMethod.accountNumber

        // Validate phone number for mobile money types
        if ((typeToValidate === 'AIRTEL_MONEY' || typeToValidate === 'MPAMBA') && validatedData.accountNumber) {
            if (!validatePhoneNumber(accountNumberToValidate, typeToValidate)) {
                return NextResponse.json(
                    { error: `Invalid phone number format for ${typeToValidate === 'AIRTEL_MONEY' ? 'Airtel Money' : 'Mpamba'}` },
                    { status: 400 }
                )
            }
        }

        const updatedMethod = await prisma.paymentMethod.update({
            where: { id: methodId },
            data: {
                ...(validatedData.type && { type: validatedData.type }),
                ...(validatedData.accountNumber && { accountNumber: validatedData.accountNumber }),
                ...(validatedData.accountName && { accountName: validatedData.accountName }),
                ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
            },
        })

        return NextResponse.json({
            message: 'Payment method updated successfully',
            paymentMethod: updatedMethod,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            )
        }

        console.error('Update payment method error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE - Remove payment method (Treasurer/Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; methodId: string }> }
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

        const { id: groupId, methodId } = await params

        // Check if user is admin or treasurer of the group
        const membership = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: userId as string,
                status: 'ACTIVE',
                role: { in: ['ADMIN', 'TREASURER'] },
            },
        })

        if (!membership) {
            return NextResponse.json(
                { error: 'Only group admins or treasurers can remove payment methods' },
                { status: 403 }
            )
        }

        // Check if payment method exists and belongs to group
        const existingMethod = await prisma.paymentMethod.findFirst({
            where: { id: methodId, groupId },
        })

        if (!existingMethod) {
            return NextResponse.json(
                { error: 'Payment method not found' },
                { status: 404 }
            )
        }

        // Soft delete by setting isActive to false
        await prisma.paymentMethod.update({
            where: { id: methodId },
            data: { isActive: false },
        })

        // Create activity log
        await prisma.activity.create({
            data: {
                userId: userId as string,
                groupId,
                actionType: 'PAYMENT_METHOD_REMOVED',
                description: `Removed payment method`,
                metadata: {
                    paymentMethodId: methodId,
                },
            },
        })

        return NextResponse.json({
            message: 'Payment method removed successfully',
        })
    } catch (error) {
        console.error('Delete payment method error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
