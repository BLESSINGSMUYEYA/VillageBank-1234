import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
// Temporarily disable Prisma imports until client is properly generated
// import { PaymentStatus } from '@prisma/client'
type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
import { z } from 'zod'

const reviewSchema = z.object({
    status: z.enum(['COMPLETED', 'REJECTED']),
    rejectionReason: z.string().optional(),
})

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = getAuth(request)
        const { id } = await params

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { status, rejectionReason } = reviewSchema.parse(body)

        // Check if the user is a treasurer or admin of the group this contribution belongs to
        const contribution = await prisma.contribution.findUnique({
            where: { id },
            include: {
                group: {
                    include: {
                        members: {
                            where: {
                                userId: userId,
                                role: { in: ['ADMIN', 'TREASURER'] },
                                status: 'ACTIVE'
                            }
                        }
                    }
                }
            }
        })

        if (!contribution || contribution.group.members.length === 0) {
            return NextResponse.json(
                { error: 'You do not have permission to review this contribution' },
                { status: 403 }
            )
        }

        const updatedContribution = await prisma.contribution.update({
            where: { id },
            data: {
                status: status as PaymentStatus,
                rejectionReason: status === 'REJECTED' ? rejectionReason : null,
                reviewedById: userId,
                reviewDate: new Date(),
            },
        })

        // Create activity log
        await prisma.activity.create({
            data: {
                userId: userId,
                groupId: contribution.groupId,
                actionType: `CONTRIBUTION_${status}`,
                description: `${status === 'COMPLETED' ? 'Approved' : 'Rejected'} contribution of MWK ${contribution.amount.toLocaleString()} from userId ${contribution.userId}`,
                metadata: {
                    contributionId: id,
                    status,
                    rejectionReason
                },
            },
        })

        // Create notification for the user
        await prisma.notification.create({
            data: {
                userId: contribution.userId,
                title: `Contribution ${status === 'COMPLETED' ? 'Approved' : 'Rejected'}`,
                message: status === 'COMPLETED'
                    ? `Your contribution of MWK ${contribution.amount.toLocaleString()} has been approved.`
                    : `Your contribution of MWK ${contribution.amount.toLocaleString()} was rejected: ${rejectionReason}`,
                type: status === 'COMPLETED' ? 'SUCCESS' : 'ERROR',
            }
        })

        return NextResponse.json({
            message: `Contribution ${status.toLowerCase()} successfully`,
            contribution: updatedContribution,
        })

    } catch (error) {
        console.error('Review contribution error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
