import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { isValidTagFormat } from '@/lib/tag-generator'

export async function POST(req: Request) {
    try {
        const session = await getSession()
        if (!session?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { tag } = await req.json()

        // 1. Validate format
        if (!isValidTagFormat(tag)) {
            return NextResponse.json(
                { error: 'Invalid tag format. Use 3-30 alphanumeric characters, dots, or underscores.' },
                { status: 400 }
            )
        }

        const cleanTag = tag.startsWith('@') ? tag.slice(1).toLowerCase() : tag.toLowerCase()

        // 2. Check uniqueness across Users
        const existingUser = await prisma.user.findFirst({
            where: {
                ubankTag: { equals: cleanTag, mode: 'insensitive' },
                NOT: { email: session.email as string } // Exclude self if updating
            }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Tag already taken' }, { status: 409 })
        }

        // 3. Check uniqueness across Groups
        const existingGroup = await prisma.group.findFirst({
            where: {
                ubankTag: { equals: cleanTag, mode: 'insensitive' }
            }
        })

        if (existingGroup) {
            return NextResponse.json({ error: 'Tag already taken by a group' }, { status: 409 })
        }

        // 4. Update User
        const updatedUser = await prisma.user.update({
            where: { email: session.email as string },
            data: { ubankTag: cleanTag }
        })

        return NextResponse.json({
            tag: updatedUser.ubankTag,
            message: 'Tag updated successfully'
        })

    } catch (error) {
        console.error('Error updating tag:', error)
        return NextResponse.json(
            { error: 'Failed to update tag' },
            { status: 500 }
        )
    }
}

export async function GET(req: Request) {
    // Optional: Endpoint to check availability without claiming
    const { searchParams } = new URL(req.url)
    const tag = searchParams.get('q')

    if (!tag || !isValidTagFormat(tag)) {
        return NextResponse.json({ available: false, reason: 'Invalid format' })
    }

    const cleanTag = tag.startsWith('@') ? tag.slice(1).toLowerCase() : tag.toLowerCase()

    const [user, group] = await Promise.all([
        prisma.user.findUnique({ where: { ubankTag: cleanTag } }),
        prisma.group.findUnique({ where: { ubankTag: cleanTag } })
    ])

    if (user || group) {
        return NextResponse.json({ available: false, reason: 'Taken' })
    }

    return NextResponse.json({ available: true })
}
