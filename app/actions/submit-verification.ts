'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { IdentityType } from '@prisma/client'

interface SubmitVerificationParams {
    type: IdentityType
    documentNumber: string
    frontImageUrl: string
    backImageUrl: string | null
    selfieImageUrl: string
}

export async function submitVerification({
    type,
    documentNumber,
    frontImageUrl,
    backImageUrl,
    selfieImageUrl
}: SubmitVerificationParams) {
    try {
        const session = await getSession()
        const userId = session?.userId as string

        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        // Check if user already has a pending or verified request
        const existing = await prisma.identityVerification.findUnique({
            where: { userId }
        })

        if (existing && existing.status === 'VERIFIED') {
            return { success: false, error: 'You are already verified.' }
        }

        if (existing && existing.status === 'PENDING') {
            // Option: Allow overwrite? Or block? Sticking to block for now.
            // Or maybe we update it? Let's assume we update logic if they resubmit.
            // But for simplicity/safety, let's update checks.
            // Actually standard flow is usually: reject -> user edits.
            // If pending, user shouldn't submit again.
            return { success: false, error: 'Verification currently under review.' }
        }

        // Upsert allows us to handle the "Rejected -> Try Again" flow easily
        // If it exists (rejected), we update. If new, we create.
        await prisma.identityVerification.upsert({
            where: { userId },
            update: {
                type,
                documentNumber,
                frontImageUrl,
                backImageUrl,
                selfieImageUrl,
                status: 'PENDING',
                rejectionReason: null, // Clear rejection reason on new submission
                submittedAt: new Date()
            },
            create: {
                userId,
                type,
                documentNumber,
                frontImageUrl,
                backImageUrl,
                selfieImageUrl
            }
        })

        // Log Activity
        await prisma.activity.create({
            data: {
                userId,
                actionType: 'IDENTITY_SUBMITTED',
                description: `Submitted ID Verification (${type})`,
            }
        })

        revalidatePath('/settings')
        return { success: true, message: 'Verification submitted successfully.' }

    } catch (error) {
        console.error('Submit verification error:', error)
        return { success: false, error: 'Failed to submit verification.' }
    }
}
