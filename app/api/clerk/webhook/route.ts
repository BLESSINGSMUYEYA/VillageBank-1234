import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUniqueUbankId } from '@/lib/id-generator'
import { Webhook } from 'svix'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!CLERK_WEBHOOK_SECRET) {
    return new NextResponse('Webhook secret not configured', { status: 500 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occurred -- no svix headers', { status: 400 })
  }

  const body = await req.json()
  const wh = new Webhook(CLERK_WEBHOOK_SECRET)

  let evt: any

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new NextResponse('Error occurred', { status: 400 })
  }

  const eventType = evt.type
  const { data } = evt

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(data)
        break
      case 'user.updated':
        await handleUserUpdated(data)
        break
      case 'user.deleted':
        await handleUserDeleted(data)
        break
    }
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new NextResponse('Error processing webhook', { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleUserCreated(data: any) {
  const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = data

  const primaryEmail = email_addresses[0]?.email_address
  const primaryPhone = phone_numbers[0]?.phone_number

  const ubankId = await generateUniqueUbankId(`${first_name || 'User'}.${last_name || 'Member'}`, 'USER')

  await prisma.user.create({
    data: {
      id,
      email: primaryEmail,
      firstName: first_name || '',
      lastName: last_name || '',
      phoneNumber: primaryPhone || '',
      role: public_metadata?.role || 'MEMBER',
      region: public_metadata?.region || 'CENTRAL',
      ubankId,
    },
  })
}

async function handleUserUpdated(data: any) {
  const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = data

  const primaryEmail = email_addresses[0]?.email_address
  const primaryPhone = phone_numbers[0]?.phone_number

  await prisma.user.update({
    where: { id },
    data: {
      email: primaryEmail,
      firstName: first_name || '',
      lastName: last_name || '',
      phoneNumber: primaryPhone || '',
      role: public_metadata?.role || 'MEMBER',
      region: public_metadata?.region || 'CENTRAL',
      updatedAt: new Date(),
    },
  })
}

async function handleUserDeleted(data: any) {
  const { id } = data

  await prisma.user.update({
    where: { id },
    data: {
      updatedAt: new Date(),
    },
  })
}
