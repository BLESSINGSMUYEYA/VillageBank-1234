'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { UserRole, UserStatus } from '@prisma/client'

/**
 * Checks if the current user is a Super Admin.
 * Throws an error if not authorized.
 */
async function authorizeSuperAdmin() {
    const session = await getSession()
    if (!session || session.role !== UserRole.SUPER_ADMIN) {
        throw new Error('Unauthorized: Super Admin access required')
    }
    return session
}

/**
 * Deletes a user from the system.
 * This will cascade delete their contributions, loans, etc. based on schema configuration.
 */
export async function deleteUser(userId: string) {
    try {
        const admin = await authorizeSuperAdmin()

        if (userId === admin.userId) {
            throw new Error('Cannot delete your own admin account')
        }

        await prisma.user.delete({
            where: { id: userId },
        })

        revalidatePath('/admin/system')
        revalidatePath('/admin/regional')
        return { success: true, message: 'User deleted successfully' }
    } catch (error: any) {
        console.error('Failed to delete user:', error)
        return { success: false, error: error.message || 'Failed to delete user' }
    }
}

/**
 * Deletes a group from the system.
 * This will cascade delete group data.
 */
export async function deleteGroup(groupId: string) {
    try {
        await authorizeSuperAdmin()

        await prisma.group.delete({
            where: { id: groupId },
        })

        revalidatePath('/admin/regional')
        revalidatePath('/admin/system')
        return { success: true, message: 'Group deleted successfully' }
    } catch (error: any) {
        console.error('Failed to delete group:', error)
        return { success: false, error: error.message || 'Failed to delete group' }
    }
}

/**
 * Toggles a user's block status (ACTIVE <-> BLOCKED).
 */
export async function toggleUserBlockStatus(userId: string, currentStatus: UserStatus) {
    try {
        const admin = await authorizeSuperAdmin()

        if (userId === admin.userId) {
            throw new Error('Cannot block your own admin account')
        }

        const newStatus = currentStatus === UserStatus.BLOCKED ? UserStatus.ACTIVE : UserStatus.BLOCKED

        await prisma.user.update({
            where: { id: userId },
            data: { status: newStatus },
        })

        revalidatePath('/admin/system')
        revalidatePath('/admin/regional')
        return { success: true, message: `User ${newStatus === UserStatus.BLOCKED ? 'blocked' : 'unblocked'} successfully`, newStatus }
    } catch (error: any) {
        console.error('Failed to update user status:', error)
        return { success: false, error: error.message || 'Failed to update user status' }
    }
}
