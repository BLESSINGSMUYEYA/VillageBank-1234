import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import CryptoJS from 'crypto-js'
import { Jimp, HorizontalAlign, VerticalAlign } from 'jimp'

const shareSchema = z.object({
  permissions: z.enum(['VIEW_ONLY', 'REQUEST_JOIN', 'LIMITED_ACCESS', 'FULL_PREVIEW']),
  expiresAt: z.string().datetime().optional(),
  maxUses: z.number().min(1).max(100).optional(),
  customMessage: z.string().max(100).optional(),
})

// Generate QR Code for group sharing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const userId = session?.userId

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId } = await params
    const body = await request.json()
    const { permissions, expiresAt, maxUses, customMessage } = shareSchema.parse(body)

    // Verify user is group admin
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: userId as string,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only group admins can create share links' },
        { status: 403 }
      )
    }

    // Generate secure token
    const shareToken = CryptoJS.SHA256(`${groupId}-${userId}-${uuidv4()}-${Date.now()}`).toString()

    // Create share record
    const groupShare = await (prisma as any).groupShare.create({
      data: {
        groupId,
        sharedById: userId as string,
        shareToken,
        shareType: 'QR_CODE',
        permissions,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses || 10,
      },
      include: {
        group: {
          select: {
            name: true,
            description: true,
            region: true,
          },
        },
      },
    })

    // Generate QR Code URL
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`
    const shareUrl = `${baseUrl}/shared/${shareToken}`

    // Generate simple QR code
    const qrCodeBuffer = await QRCode.toBuffer(shareUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1e40af', // Blue color for branding
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // Higher error correction to allow branding
    })

    // Add branding with Jimp
    let finalBuffer = qrCodeBuffer
    try {
      const { Jimp } = await import('jimp')
      const qrImage = await Jimp.read(qrCodeBuffer)

      // Create a canvas for the branded image (400x460 to allow space for text)
      const canvas = new Jimp({
        width: 400,
        height: 460,
        color: 0xFFFFFFFF
      })

      // Place QR code on canvas
      canvas.composite(qrImage, 0, 0)

      // Add "Village Banking" text branding at the bottom
      try {
        try {
          // Try to import fonts safely
          const { SANS_32_BLACK } = await import('jimp/fonts')
          const { loadFont } = await import('jimp')

          if (loadFont && SANS_32_BLACK) {
            const font = await loadFont(SANS_32_BLACK)

            canvas.print({
              font,
              x: 0,
              y: 405,
              text: {
                text: 'Village Banking',
                alignmentX: HorizontalAlign.CENTER,
                alignmentY: VerticalAlign.MIDDLE
              },
              maxWidth: 400
            })
          }
        } catch (e) {
          console.log("Font/Text branding failed, using plain QR on canvas")
        }
      } catch (fontError) {
        console.error('Font loading error:', fontError)
      }

      finalBuffer = await canvas.getBuffer('image/png')
    } catch (jimpError) {
      console.error('Jimp branding error, falling back to standard QR:', jimpError)
      finalBuffer = qrCodeBuffer
    }

    const qrCodeDataUrl = `data:image/png;base64,${finalBuffer.toString('base64')}`

    return NextResponse.json({
      shareId: groupShare.id,
      shareToken,
      shareUrl,
      qrCode: qrCodeDataUrl,
      permissions,
      expiresAt: groupShare.expiresAt,
      maxUses: groupShare.maxUses,
      currentUses: groupShare.currentUses,
      customMessage: customMessage || null,
      group: groupShare.group,
    })

  } catch (error) {
    console.error('Create share error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get all active shares for a group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const userId = session?.userId

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId } = await params

    // Verify user is group admin
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: userId as string,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only group admins can view shares' },
        { status: 403 }
      )
    }

    const shares = await (prisma as any).groupShare.findMany({
      where: {
        groupId,
        isActive: true,
      },
      include: {
        qrAnalytics: {
          orderBy: { scannedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { qrAnalytics: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(shares)

  } catch (error) {
    console.error('Get shares error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
