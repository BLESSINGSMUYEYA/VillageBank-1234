'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { MeetingFrequency, Region } from '@prisma/client'

export type UpdateGroupDetailsState = {
    success?: boolean
    error?: string
    message?: string
}

export async function updateGroupDetails(
    prevState: UpdateGroupDetailsState | null,
    formData: FormData
): Promise<UpdateGroupDetailsState> {
    const session = await getSession()
    if (!session?.user) {
        return { error: 'Unauthorized: No active session found. Please log in again.' }
    }

    const groupId = formData.get('groupId') as string
    const userId = (session.user as any).id

    // Validate user is admin of the group
    const membership = await prisma.groupMember.findUnique({
        where: {
            groupId_userId: {
                groupId: groupId,
                userId: userId
            }
        }
    })

    console.log('[DEBUG] UpdateGroupDetails - User:', userId, 'Group:', groupId, 'Membership:', membership);

    if (!membership) {
        return { error: `Unauthorized: You are not a member of this group. (User: ${userId}, Group: ${groupId})` }
    }

    if (membership.role !== 'ADMIN') {
        return { error: `Unauthorized: You are a ${membership.role}, but ADMIN access is required.` }
    }

    try {
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const region = formData.get('region') as Region
        const meetingLocation = formData.get('meetingLocation') as string
        const contactEmail = formData.get('contactEmail') as string
        const contactPhone = formData.get('contactPhone') as string
        const meetingFrequency = formData.get('meetingFrequency') as MeetingFrequency

        // Validate required fields
        if (!name) return { error: 'Group name is required' }
        if (!region) return { error: 'Region is required' }

        await prisma.group.update({
            where: { id: groupId },
            data: {
                name,
                description,
                region,
                meetingLocation,
                contactEmail,
                contactPhone,
                meetingFrequency
            }
        })

        revalidatePath(`/groups/${groupId}`)
        revalidatePath(`/groups/${groupId}/settings`)
        revalidatePath(`/groups/${groupId}/policies`)

        return {
            success: true,
            message: 'Group details updated successfully'
        }
    } catch (error) {
        console.error('Failed to update group details:', error)
        return {
            success: false,
            error: 'Failed to update group details'
        }
    }
}
