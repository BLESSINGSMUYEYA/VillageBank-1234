'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { NotificationService } from '@/lib/notification-service'

interface ReviewVerificationParams {
    targetUserId: string
    action: 'APPROVE' | 'REJECT'
    reason?: string // Required if rejected
}

export async function reviewVerification({
    targetUserId,
    action,
    reason
}: ReviewVerificationParams) {
    try {
        const session = await getSession()
        const adminId = session?.userId as string

        if (!adminId) return { success: false, error: 'Unauthorized' }

        // Verify Admin Role (Super Admin only for now)
        const adminUser = await prisma.user.findUnique({
            where: { id: adminId }
        })

        if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
            // Fallback: Check if they are ADMIN in *any* group?
            // For security, Identity Verification should likely be Platform-level or specific High-Trust Admins.
            // Let's stick to SUPER_ADMIN for safety initially, or allow REGIONAL_ADMIN.
            // If testing locally where maybe no one is super admin, we might need a workaround,
            // but for prod logic:
            if (adminUser?.role !== 'SUPER_ADMIN' && adminUser?.role !== 'REGIONAL_ADMIN') {
                return { success: false, error: 'Insufficient permissions.' }
            }
        }

        const verification = await prisma.identityVerification.findUnique({
            where: { userId: targetUserId },
            include: { user: true } // Fetch user to check their region
        })

        if (!verification) {
            return { success: false, error: 'Verification request not found.' }
        }

        // Logic: Regional Admins can only verify users in their own region
        if (adminUser.role === 'REGIONAL_ADMIN') {
            if (adminUser.region !== verification.user.region) {
                return { success: false, error: `You can only verify members in your region (${adminUser.region}).` }
            }
        }

        if (action === 'APPROVE') {
            await prisma.identityVerification.update({
                where: { userId: targetUserId },
                data: {
                    status: 'VERIFIED',
                    verifiedAt: new Date(),
                    verifiedById: adminId,
                    rejectionReason: null
                }
            })

            // Send Success Notification
            await NotificationService.send({
                userId: targetUserId,
                title: 'Identity Verified',
                message: 'Your identity has been successfully verified. You now have the verified badge!',
                type: 'SUCCESS'
            })

        } else {
            if (!reason) return { success: false, error: 'Rejection reason is required.' }

            await prisma.identityVerification.update({
                where: { userId: targetUserId },
                data: {
                    status: 'REJECTED',
                    verifiedAt: new Date(), // Processed at
                    verifiedById: adminId,
                    rejectionReason: reason
                }
            })

            // Send Rejection Notification
            await NotificationService.send({
                userId: targetUserId,
                title: 'Verification Failed',
                message: `Your identity verification was rejected: ${reason}`,
                type: 'ERROR',
                actionUrl: '/settings',
                actionText: 'Update Details'
            })
        }

        revalidatePath('/admin/verifications')
        return { success: true, message: `Request ${action === 'APPROVE' ? 'Approved' : 'Rejected'}` }

    } catch (error) {
        console.error('Review verification error:', error)
        return { success: false, error: 'Failed to process review.' }
    }
}
