import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'TREASURER', 'SECRETARY', 'MEMBER'])
})

export async function PATCH(
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
    const body = await request.json()
    const validatedData = updateRoleSchema.parse(body)

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
        { error: 'Only group admins can change member roles' },
        { status: 403 }
      )
    }

    // Check if the target member exists and is active
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

    // Prevent admins from removing their own admin role
    if (targetMember.userId === userId && validatedData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admins cannot remove their own admin role' },
        { status: 400 }
      )
    }

    // Update the member's role and status
    const updateData: { role: 'ADMIN' | 'TREASURER' | 'SECRETARY' | 'MEMBER'; status?: 'ACTIVE' } = { role: validatedData.role }

    // If the member was pending, activate them when approving
    if (targetMember.status === 'PENDING') {
      updateData.status = 'ACTIVE'
    }

    const updatedMember = await prisma.groupMember.update({
      where: { id: memberId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: groupId,
        actionType: 'MEMBER_ROLE_CHANGED',
        description: `Changed ${targetMember.user.firstName || ''} ${targetMember.user.lastName || ''}'s role from ${targetMember.role} to ${validatedData.role}`,
        metadata: {
          memberId: memberId,
          oldRole: targetMember.role,
          newRole: validatedData.role,
          targetUserId: targetMember.userId,
        },
      },
    })

    return NextResponse.json({
      message: 'Member role updated successfully',
      member: {
        ...updatedMember,
        joinedAt: updatedMember.joinedAt.toISOString(),
      },
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Update member role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

