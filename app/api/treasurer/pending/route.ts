import { NextRequest, NextResponse } from 'next/server'
import { getPendingApprovals } from '@/lib/dashboard-service'

export async function GET() {
    try {
        const pending = await getPendingApprovals()
        return NextResponse.json(pending)
    } catch (error) {
        console.error('Error in treasurer pending API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
