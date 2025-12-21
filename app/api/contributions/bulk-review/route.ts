import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'
import { z } from 'zod'

const bulkReviewSchema = z.object({
  contributionIds: z.array(z.string()).min(1, 'At least one contribution ID is required'),
  status: z.enum(['COMPLETED', 'REJECTED']),
  rejectionReason: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contributionIds, status, rejectionReason } = bulkReviewSchema.parse(body)

    // Verify user has treasurer/admin permissions for all contributions
    const contributions = await prisma.contribution.findMany({
      where: {
        id: { in: contributionIds },
        status: 'PENDING', // Only allow reviewing pending contributions
      },
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
        },
        user: true
      }
    })

    // Check if user has permission for all requested contributions
    const unauthorizedContributions = contributions.filter(c => c.group.members.length === 0)
    if (unauthorizedContributions.length > 0) {
      return NextResponse.json(
        { error: 'You do not have permission to review some of these contributions' },
        { status: 403 }
      )
    }

    // Update all contributions
    const updatedContributions = await prisma.contribution.updateMany({
      where: {
        id: { in: contributionIds },
        status: 'PENDING'
      },
      data: {
        status: status as PaymentStatus,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        reviewedById: userId,
        reviewDate: new Date(),
      }
    })

    // Create activity logs and notifications for each contribution
    const activities = contributions.map(contribution => ({
      userId: userId,
      groupId: contribution.groupId,
      actionType: `CONTRIBUTION_${status}`,
      description: `${status === 'COMPLETED' ? 'Approved' : 'Rejected'} contribution of MWK ${contribution.amount.toLocaleString()} from ${contribution.user.firstName} ${contribution.user.lastName}`,
      metadata: {
        contributionId: contribution.id,
        status,
        rejectionReason,
        bulkOperation: true
      },
    }))

    const notifications = contributions.map(contribution => ({
      userId: contribution.userId,
      title: `Contribution ${status === 'COMPLETED' ? 'Approved' : 'Rejected'}`,
      message: status === 'COMPLETED'
        ? `Your contribution of MWK ${contribution.amount.toLocaleString()} has been approved.`
        : `Your contribution of MWK ${contribution.amount.toLocaleString()} was rejected: ${rejectionReason || 'No reason provided'}`,
      type: status === 'COMPLETED' ? 'SUCCESS' : 'ERROR',
    }))

    // Create activity logs
    await prisma.activity.createMany({
      data: activities
    })

    // Create notifications
    await prisma.notification.createMany({
      data: notifications
    })

    return NextResponse.json({
      message: `Successfully ${status.toLowerCase()} ${updatedContributions.count} contributions`,
      updatedCount: updatedContributions.count,
      contributions: contributions.map(c => ({
        id: c.id,
        amount: c.amount,
        userName: `${c.user.firstName} ${c.user.lastName}`,
        groupName: c.group.name
      }))
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues)
      return NextResponse.json(
        {
          error: 'Validation failed: ' + error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        },
        { status: 400 }
      )
    }

    console.error('Bulk review contribution error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
