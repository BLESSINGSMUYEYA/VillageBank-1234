import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession()
        const userId = session?.userId as string

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Delete all notifications for the user
        const result = await prisma.notification.deleteMany({
            where: {
                userId: userId
            }
        })

        return NextResponse.json({
            message: 'All notifications cleared successfully',
            count: result.count
        })

    } catch (error) {
        console.error('Clear all notifications error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
