import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const requestJoinSchema = z.object({
  groupId: z.string(),
  shareToken: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.userId as string

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = requestJoinSchema.parse(body)

    // Ensure user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: validatedData.groupId },
      include: {
        members: {
          where: { userId: userId }
        }
      }
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Check if user is already a member
    if (group.members.length > 0) {
      const existingMember = group.members[0]
      if (existingMember.status === 'ACTIVE') {
        return NextResponse.json({
          message: 'You are already a member of this group',
          alreadyMember: true,
          groupId: group.id
        })
      }
      if (existingMember.status === 'PENDING') {
        return NextResponse.json({
          message: 'Join request already sent',
          alreadyPending: true,
          groupId: group.id
        })
      }
    }

    // If share token is provided, validate it
    if (validatedData.shareToken) {
      const shareLink = await prisma.groupShare.findUnique({
        where: { shareToken: validatedData.shareToken }
      })

      if (!shareLink || shareLink.groupId !== validatedData.groupId) {
        return NextResponse.json(
          { error: 'Invalid or expired share link' },
          { status: 400 }
        )
      }

      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Share link has expired' },
          { status: 400 }
        )
      }

      // Check if permissions allow joining
      if (shareLink.permissions === 'VIEW_ONLY') {
        return NextResponse.json(
          { error: 'This share link does not allow joining requests' },
          { status: 403 }
        )
      }
    }

    // Create join request
    const joinRequest = await prisma.groupMember.create({
      data: {
        groupId: validatedData.groupId,
        userId: userId,
        role: 'MEMBER',
        status: 'PENDING',
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: validatedData.groupId,
        actionType: 'JOIN_REQUESTED',
        description: `Requested to join group "${group.name}"`,
      },
    })

    // Find group admins and send notifications
    const adminMembers = await prisma.groupMember.findMany({
      where: {
        groupId: validatedData.groupId,
        role: 'ADMIN',
        status: 'ACTIVE',
      }
    })

    // Send notifications to all admins
    if (adminMembers.length > 0) {
      await Promise.all(
        adminMembers.map((admin) =>
          prisma.notification.create({
            data: {
              userId: admin.userId,
              type: 'INFO',
              title: 'New Join Request',
              message: `${existingUser.firstName || 'Someone'} ${existingUser.lastName || ''} wants to join your group "${group.name}"`,
              actionUrl: `/groups/${validatedData.groupId}`,
              actionText: 'Review Request',
              read: false,
            }
          })
        )
      )
    }

    // Update share link usage count if applicable
    if (validatedData.shareToken) {
      await prisma.groupShare.update({
        where: { shareToken: validatedData.shareToken },
        data: {
          currentUses: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json({
      message: 'Join request sent successfully',
      requestId: joinRequest.id,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Validation error: ${error.issues[0].message}` },
        { status: 400 }
      )
    }

    console.error('Request to join error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'You already have a pending request for this group' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to send join request. Please try again.' },
      { status: 500 }
    )
  }
}
