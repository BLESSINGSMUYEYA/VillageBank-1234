import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    try {
        const session = await getSession()
        const userId = session?.userId as string

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id: groupId, memberId } = await params

        // Check if the requester is an admin of the group
        const adminMembership = await prisma.groupMember.findFirst({
            where: {
                groupId: groupId,
                userId: userId,
                role: 'ADMIN',
                status: 'ACTIVE',
            },
        })

        if (!adminMembership) {
            return NextResponse.json(
                { error: 'Only group admins can remove members' },
                { status: 403 }
            )
        }

        // Check if the target member exists
        const targetMember = await prisma.groupMember.findUnique({
            where: { id: memberId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        })

        if (!targetMember) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            )
        }

        if (targetMember.groupId !== groupId) {
            return NextResponse.json(
                { error: 'Member does not belong to this group' },
                { status: 400 }
            )
        }

        // Prevent admins from removing themselves
        if (targetMember.userId === userId) {
            return NextResponse.json(
                { error: 'Admins cannot remove themselves from the group' },
                { status: 400 }
            )
        }

        // Remove the member
        await prisma.groupMember.delete({
            where: { id: memberId },
        })

        // Create activity log
        await prisma.activity.create({
            data: {
                userId: userId,
                groupId: groupId,
                actionType: 'MEMBER_REMOVED',
                description: `Removed ${targetMember.user.firstName || ''} ${targetMember.user.lastName || ''} from the group`,
                metadata: {
                    memberId: memberId,
                    targetUserId: targetMember.userId,
                    removedRole: targetMember.role,
                },
            },
        })

        return NextResponse.json({
            message: 'Member removed successfully',
        })

    } catch (error) {
        console.error('Remove member error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
