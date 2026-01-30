import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: {
                    select: { firstName: true, lastName: true }
                },
                _count: {
                    select: { notifications: true } // Total Sent
                }
            }
        })

        // Initial stats structure


        const data = announcements.map(a => ({
            ...a,
            stats: {
                sent: (a as any)._count.notifications,
                read: 0
            }
        }))

        // Also fetch "read" counts effectively
        // Prisma doesn't support filtered relation counts in the same query easily without raw query or separate queries
        // Let's do a separate group by for speed
        if (announcements.length > 0) {
            const announcementIds = announcements.map(a => a.id)

            const readCounts = await prisma.notification.groupBy({
                by: ['announcementId'],
                where: {
                    announcementId: { in: announcementIds },
                    read: true
                },
                _count: {
                    _all: true
                }
            })

            data.forEach(a => {
                const readEntry = readCounts.find(r => r.announcementId === a.id)
                a.stats.read = readEntry?._count._all || 0
            })
        }

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request) as { userId: string, role: string } | null

        // Check for admin role (assuming role management is in place, strictly speaking should verify system admin)
        if (!session?.userId || (session.role !== 'SUPER_ADMIN' && session.role !== 'REGIONAL_ADMIN')) {
            // For safety, let's restrict to super admin for now or check exact roles
            if (session?.role !== 'SUPER_ADMIN') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        const body = await request.json()
        const { title, message, link, type, imageUrl, actionText } = body

        const announcement = await prisma.announcement.create({
            data: {
                title,
                message,
                link,
                imageUrl,
                actionText,
                type: type || 'BANNER',
                createdById: session.userId,
                isActive: true
            }
        })

        return NextResponse.json(announcement)
    } catch (error) {
        console.error('Error creating announcement:', error)
        return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request) as { userId: string, role: string } | null
        if (!session?.userId || (session.role !== 'SUPER_ADMIN' && session.role !== 'REGIONAL_ADMIN')) {
            if (session?.role !== 'SUPER_ADMIN') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        const body = await request.json()
        const { id, title, message, link, type, imageUrl, actionText } = body

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        const announcement = await prisma.announcement.update({
            where: { id },
            data: {
                title,
                message,
                link,
                imageUrl,
                actionText,
                type: type || 'BANNER'
            }
        })

        return NextResponse.json(announcement)
    } catch (error) {
        console.error('Error updating announcement:', error)
        return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request) as { userId: string, role: string } | null
        if (!session?.userId || session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        await prisma.announcement.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
