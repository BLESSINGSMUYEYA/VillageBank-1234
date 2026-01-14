'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface RecordCashTransactionParams {
    groupId: string
    userId: string
    amount: number
    month: number
    year: number
    description?: string
}

export async function recordCashTransaction({
    groupId,
    userId,
    amount,
    month,
    year,
    description
}: RecordCashTransactionParams) {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
        throw new Error('Unauthorized')
    }

    // Verify current user is an admin or treasurer of the group
    const currentUserMember = await prisma.groupMember.findUnique({
        where: {
            groupId_userId: {
                groupId,
                userId: currentUserId
            }
        }
    })

    if (!currentUserMember || !['ADMIN', 'TREASURER'].includes(currentUserMember.role)) {
        throw new Error('Only admins or treasurers can record cash transactions')
    }

    try {
        // Create the contribution record
        const contribution = await prisma.contribution.create({
            data: {
                groupId,
                userId,
                amount,
                month,
                year,
                paymentMethod: 'CASH',
                status: 'COMPLETED',
                transactionRef: `CASH-${Date.now()}`,
                reviewedById: currentUserId,
                reviewDate: new Date(),
                // If description is provided, maybe store it in a note or metadata field if schema supported it.
                // For now, we can maybe use transactionRef or just log it.
                // Or if we want to be clean, we just rely on standard fields.
            }
        })

        // Log the activity
        await prisma.activity.create({
            data: {
                userId: currentUserId,
                groupId,
                actionType: 'RECORD_CASH',
                description: `Recorded cash contribution of ${amount} for user ${userId}`,
                metadata: {
                    contributionId: contribution.id,
                    amount,
                    targetUserId: userId,
                    notes: description
                }
            }
        })

        revalidatePath(`/groups/${groupId}`)
        revalidatePath('/dashboard')

        return { success: true, data: contribution }
    } catch (error) {
        console.error('Failed to record cash transaction:', error)
        throw new Error('Failed to record cash transaction')
    }
}
