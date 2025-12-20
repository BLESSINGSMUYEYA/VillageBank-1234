import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from Clerk
    const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())

    if (!clerkUser.id) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 })
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // If user doesn't exist, create them
    if (!user) {
      const primaryEmail = clerkUser.email_addresses[0]?.email_address
      const primaryPhone = clerkUser.phone_numbers[0]?.phone_number

      user = await prisma.user.create({
        data: {
          id: userId,
          email: primaryEmail,
          firstName: clerkUser.first_name || '',
          lastName: clerkUser.last_name || '',
          phoneNumber: primaryPhone || '',
          role: clerkUser.public_metadata?.role || 'MEMBER',
          region: clerkUser.public_metadata?.region || 'CENTRAL',
        },
      })
    }

    return NextResponse.json({ 
      message: 'User synced successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    })

  } catch (error) {
    console.error('User sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
