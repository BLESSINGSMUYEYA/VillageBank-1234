import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { validatePhoneNumber } from '@/lib/payments'

const createPaymentMethodSchema = z.object({
    type: z.enum(['AIRTEL_MONEY', 'MPAMBA', 'BANK_CARD']),
    accountNumber: z.string().min(8, 'Account number must be at least 8 characters'),
    accountName: z.string().min(2, 'Account name must be at least 2 characters'),
    bankName: z.string().optional(),
})

// GET - Fetch group's payment methods (visible to all members)
export async function GET(
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

        const { id: groupId } = await params

        // Check if user is a member of the group
        const membership = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: userId as string,
                status: 'ACTIVE',
            },
        })

        if (!membership) {
            return NextResponse.json(
                { error: 'You are not a member of this group' },
                { status: 403 }
            )
        }

        const paymentMethods = await prisma.paymentMethod.findMany({
            where: { groupId, isActive: true },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ paymentMethods })
    } catch (error) {
        console.error('Get group payment methods error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Add new payment method (Treasurer/Admin only)
export async function POST(
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

        const { id: groupId } = await params
        const body = await request.json()
        const validatedData = createPaymentMethodSchema.parse(body)

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
                { error: 'Only group admins or treasurers can add payment methods' },
                { status: 403 }
            )
        }

        // Validate phone number for mobile money types
        if (validatedData.type === 'AIRTEL_MONEY' || validatedData.type === 'MPAMBA') {
            if (!validatePhoneNumber(validatedData.accountNumber, validatedData.type)) {
                return NextResponse.json(
                    { error: `Invalid phone number format for ${validatedData.type === 'AIRTEL_MONEY' ? 'Airtel Money' : 'Mpamba'}` },
                    { status: 400 }
                )
            }
        }

        const paymentMethod = await prisma.paymentMethod.create({
            data: {
                groupId,
                type: validatedData.type,
                accountNumber: validatedData.accountNumber,
                accountName: validatedData.accountName,
                bankName: validatedData.bankName,
                addedById: userId as string,
                isActive: true,
            },
        })

        // Create activity log
        await prisma.activity.create({
            data: {
                userId: userId as string,
                groupId,
                actionType: 'PAYMENT_METHOD_ADDED',
                description: `Added ${validatedData.type === 'AIRTEL_MONEY' ? 'Airtel Money' : validatedData.type === 'MPAMBA' ? 'Mpamba' : 'Bank'} payment method`,
                metadata: {
                    paymentMethodId: paymentMethod.id,
                    type: validatedData.type,
                    accountName: validatedData.accountName,
                },
            },
        })

        return NextResponse.json({
            message: 'Payment method added successfully',
            paymentMethod,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            )
        }

        console.error('Create group payment method error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE - Archive/Delete payment method (Treasurer/Admin only)
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

        const { id: groupId } = await params
        const url = new URL(request.url)
        const methodId = url.searchParams.get('methodId')

        if (!methodId) {
            return NextResponse.json(
                { error: 'Method ID is required' },
                { status: 400 }
            )
        }

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
                { error: 'Only group admins or treasurers can delete payment methods' },
                { status: 403 }
            )
        }

        // Soft delete
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
                description: 'Removed a payment method',
                metadata: {
                    paymentMethodId: methodId,
                },
            },
        })

        return NextResponse.json({
            message: 'Payment method removed successfully',
            success: true
        })
    } catch (error) {
        console.error('Delete group payment method error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
