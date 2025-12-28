import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PenaltyService } from '@/lib/penalty-service'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        const userId = session?.userId as string
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: groupId } = await params

        // Check if user is admin or treasurer
        const membership = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId,
                role: { in: ['ADMIN', 'TREASURER'] },
                status: 'ACTIVE'
            }
        })

        if (!membership) {
            return NextResponse.json(
                { error: 'Only admins and treasurers can trigger penalty checks' },
                { status: 403 }
            )
        }

        const result = await PenaltyService.checkGroupPenalties(groupId)

        if (result.errors.length > 0) {
            return NextResponse.json(
                { error: 'Failed to complete penalty check', details: result.errors },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: 'Penalty check completed',
            penaltiesApplied: result.penaltiesApplied,
            totalAmount: result.totalAmount
        })

    } catch (error) {
        console.error('Penalty check error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
