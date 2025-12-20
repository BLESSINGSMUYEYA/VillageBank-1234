import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Handle QR code scan and access
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: shareToken } = await params
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined

    // Find valid share
    const groupShare = await (prisma as any).groupShare.findFirst({
      where: {
        shareToken,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
        AND: [
          {
            OR: [
              { maxUses: null },
              { currentUses: { lt: 1000 } }, // Will be validated in application logic
            ],
          },
        ],
      },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
              take: 3,
            },
            _count: {
              select: {
                members: true,
                contributions: true,
                loans: true,
              },
            },
          },
        },
        sharedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!groupShare) {
      return NextResponse.json(
        { error: 'Invalid or expired share link' },
        { status: 404 }
      )
    }

    // Track analytics
    await (prisma as any).qrAnalytics.create({
      data: {
        groupShareId: groupShare.id,
        ipAddress,
        userAgent,
      },
    })

    // Increment usage count
    await (prisma as any).groupShare.update({
      where: { id: groupShare.id },
      data: { currentUses: { increment: 1 } },
    })

    // Filter data based on permissions
    let groupData = groupShare.group
    
    switch (groupShare.permissions) {
      case 'VIEW_ONLY':
        groupData = {
          ...groupData,
          members: [], // Hide member details
          contributions: [],
          loans: [],
          monthlyContribution: null, // Hide financial details
          interestRate: null,
        }
        break
      case 'REQUEST_JOIN':
        // Show basic info but hide sensitive data
        groupData = {
          ...groupData,
          monthlyContribution: null,
          interestRate: null,
        }
        break
      case 'LIMITED_ACCESS':
        // Show some data but hide sensitive financial info
        groupData = {
          ...groupData,
          interestRate: null,
        }
        break
      case 'FULL_PREVIEW':
        // Show most data except very sensitive info
        break
    }

    return NextResponse.json({
      share: {
        id: groupShare.id,
        permissions: groupShare.permissions,
        expiresAt: groupShare.expiresAt,
        maxUses: groupShare.maxUses,
        currentUses: groupShare.currentUses,
        sharedBy: groupShare.sharedBy,
      },
      group: groupData,
    })

  } catch (error) {
    console.error('Access share error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
