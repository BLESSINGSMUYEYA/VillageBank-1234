import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { MemberStatus } from '@prisma/client'
import { z } from 'zod'
import { formatCurrency } from '@/lib/utils'

const bulkOperationSchema = z.object({
  operation: z.enum(['approve_loans', 'reject_loans', 'delete_members', 'update_member_status', 'send_notifications']),
  targetIds: z.array(z.string()).min(1),
  params: z.object({
    reason: z.string().optional(),
    newStatus: z.string().optional(),
    message: z.string().optional(),
    subject: z.string().optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'REGIONAL_ADMIN')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { operation, targetIds, params } = bulkOperationSchema.parse(body)

    let results: any[] = []
    let errors: any[] = []

    switch (operation) {
      case 'approve_loans':
        results = await approveLoansBulk(targetIds, userId, params?.reason)
        break
      case 'reject_loans':
        results = await rejectLoansBulk(targetIds, userId, params?.reason)
        break
      case 'delete_members':
        results = await deleteMembersBulk(targetIds, userId)
        break
      case 'update_member_status':
        results = await updateMemberStatusBulk(targetIds, userId, params?.newStatus)
        break
      case 'send_notifications':
        results = await sendNotificationsBulk(targetIds, userId, params?.message, params?.subject)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Bulk ${operation} completed`,
      results,
      errors,
      summary: {
        total: targetIds.length,
        successful: results.length,
        failed: errors.length
      }
    })

  } catch (error) {
    console.error('Bulk operation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function approveLoansBulk(loanIds: string[], adminId: string, reason?: string) {
  const results: any[] = []

  for (const loanId of loanIds) {
    try {
      const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: { group: true, user: true }
      })

      if (!loan) {
        results.push({ id: loanId, success: false, error: 'Loan not found' })
        continue
      }

      if (loan.status !== 'PENDING') {
        results.push({ id: loanId, success: false, error: 'Loan not in pending status' })
        continue
      }

      // Update loan status
      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: {
          status: 'APPROVED',
          amountApproved: loan.amountRequested,
          approvedAt: new Date(),
          approvedById: adminId
        }
      })

      // Create activity log
      await prisma.activity.create({
        data: {
          userId: adminId,
          groupId: loan.groupId,
          actionType: 'LOAN_BULK_APPROVE',
          description: `Approved loan for ${loan.user.firstName} ${loan.user.lastName} - ${formatCurrency(loan.amountRequested)}`,
          metadata: {
            loanId: loan.id,
            userId: loan.userId,
            amount: loan.amountRequested,
            reason
          }
        }
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: loan.userId,
          type: 'SUCCESS',
          title: 'Loan Approved',
          message: `Your loan request for ${formatCurrency(loan.amountRequested)} has been approved`,
          actionUrl: `/loans/${loan.id}`,
          actionText: 'View Loan'
        }
      })

      results.push({ 
        id: loanId, 
        success: true, 
        loan: updatedLoan,
        message: `Loan for ${loan.user.firstName} ${loan.user.lastName} approved`
      })

    } catch (error) {
      console.error(`Error approving loan ${loanId}:`, error)
      results.push({ id: loanId, success: false, error: 'Failed to approve loan' })
    }
  }

  return results
}

async function rejectLoansBulk(loanIds: string[], adminId: string, reason?: string) {
  const results: any[] = []

  for (const loanId of loanIds) {
    try {
      const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: { group: true, user: true }
      })

      if (!loan) {
        results.push({ id: loanId, success: false, error: 'Loan not found' })
        continue
      }

      if (loan.status !== 'PENDING') {
        results.push({ id: loanId, success: false, error: 'Loan not in pending status' })
        continue
      }

      // Update loan status
      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectedById: adminId,
          rejectionReason: reason || 'Rejected by admin'
        }
      })

      // Create activity log
      await prisma.activity.create({
        data: {
          userId: adminId,
          groupId: loan.groupId,
          actionType: 'LOAN_BULK_REJECT',
          description: `Rejected loan for ${loan.user.firstName} ${loan.user.lastName} - ${formatCurrency(loan.amountRequested)}`,
          metadata: {
            loanId: loan.id,
            userId: loan.userId,
            amount: loan.amountRequested,
            reason
          }
        }
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: loan.userId,
          type: 'WARNING',
          title: 'Loan Rejected',
          message: `Your loan request for ${formatCurrency(loan.amountRequested)} has been rejected${reason ? ': ' + reason : ''}`,
          actionUrl: `/loans/${loan.id}`,
          actionText: 'View Loan'
        }
      })

      results.push({ 
        id: loanId, 
        success: true, 
        loan: updatedLoan,
        message: `Loan for ${loan.user.firstName} ${loan.user.lastName} rejected`
      })

    } catch (error) {
      console.error(`Error rejecting loan ${loanId}:`, error)
      results.push({ id: loanId, success: false, error: 'Failed to reject loan' })
    }
  }

  return results
}

async function deleteMembersBulk(memberIds: string[], adminId: string) {
  const results: any[] = []

  for (const memberId of memberIds) {
    try {
      const member = await prisma.groupMember.findUnique({
        where: { id: memberId },
        include: { group: true, user: true }
      })

      if (!member) {
        results.push({ id: memberId, success: false, error: 'Member not found' })
        continue
      }

      // Soft delete by updating status
      const updatedMember = await prisma.groupMember.update({
        where: { id: memberId },
        data: {
          status: 'SUSPENDED'
        }
      })

      // Create activity log
      await prisma.activity.create({
        data: {
          userId: adminId,
          groupId: member.groupId,
          actionType: 'MEMBER_BULK_REMOVE',
          description: `Removed ${member.user.firstName} ${member.user.lastName} from ${member.group.name}`,
          metadata: {
            memberId: member.id,
            userId: member.userId,
            groupId: member.groupId
          }
        }
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: member.userId,
          type: 'WARNING',
          title: 'Removed from Group',
          message: `You have been removed from ${member.group.name}`,
          actionUrl: `/groups/${member.groupId}`,
          actionText: 'View Group'
        }
      })

      results.push({ 
        id: memberId, 
        success: true, 
        member: updatedMember,
        message: `Member ${member.user.firstName} ${member.user.lastName} removed from ${member.group.name}`
      })

    } catch (error) {
      console.error(`Error removing member ${memberId}:`, error)
      results.push({ id: memberId, success: false, error: 'Failed to remove member' })
    }
  }

  return results
}

async function updateMemberStatusBulk(memberIds: string[], adminId: string, newStatus?: string) {
  const results: any[] = []

  for (const memberId of memberIds) {
    try {
      const member = await prisma.groupMember.findUnique({
        where: { id: memberId },
        include: { group: true, user: true }
      })

      if (!member) {
        results.push({ id: memberId, success: false, error: 'Member not found' })
        continue
      }

      const updatedMember = await prisma.groupMember.update({
        where: { id: memberId },
        data: { status: (newStatus || 'ACTIVE') as MemberStatus }
      })

      // Create activity log
      await prisma.activity.create({
        data: {
          userId: adminId,
          groupId: member.groupId,
          actionType: 'MEMBER_BULK_STATUS_UPDATE',
          description: `Updated ${member.user.firstName} ${member.user.lastName} status to ${newStatus || 'ACTIVE'} in ${member.group.name}`,
          metadata: {
            memberId: member.id,
            userId: member.userId,
            groupId: member.groupId,
            oldStatus: member.status,
            newStatus: newStatus || 'ACTIVE'
          }
        }
      })

      results.push({ 
        id: memberId, 
        success: true, 
        member: updatedMember,
        message: `Member ${member.user.firstName} ${member.user.lastName} status updated to ${newStatus || 'ACTIVE'}`
      })

    } catch (error) {
      console.error(`Error updating member status ${memberId}:`, error)
      results.push({ id: memberId, success: false, error: 'Failed to update member status' })
    }
  }

  return results
}

async function sendNotificationsBulk(userIds: string[], adminId: string, message?: string, subject?: string) {
  const results: any[] = []

  for (const userId of userIds) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        results.push({ id: userId, success: false, error: 'User not found' })
        continue
      }

      const notification = await prisma.notification.create({
        data: {
          userId,
          type: 'INFO',
          title: subject || 'System Notification',
          message: message || 'This is a bulk notification from the administrator',
          actionUrl: '/dashboard',
          actionText: 'View Dashboard'
        }
      })

      results.push({ 
        id: userId, 
        success: true, 
        notification,
        message: `Notification sent to ${user.firstName} ${user.lastName}`
      })

    } catch (error) {
      console.error(`Error sending notification to ${userId}:`, error)
      results.push({ id: userId, success: false, error: 'Failed to send notification' })
    }
  }

  return results
}
