import { config } from 'dotenv'
// Temporarily disable Prisma imports until client is properly generated
// import { PrismaClient } from '@prisma/client'
import { prisma } from '../lib/prisma';

// Load environment variables
config({ path: '.env' })

// const prisma = new PrismaClient()

async function syncClerkUser(clerkId: string, email: string, firstName: string, lastName: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: clerkId }
    })

    if (existingUser) {
      console.log(`User ${email} already exists in Prisma`)
      return existingUser
    }

    // Create or update user in Prisma
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        id: clerkId, // Update ID to match Clerk ID
        firstName,
        lastName,
        phoneNumber: '',
        role: 'MEMBER', // Default role, can be upgraded later
        region: 'CENTRAL',
      },
      create: {
        id: clerkId,
        email,
        firstName,
        lastName,
        phoneNumber: '',
        role: 'MEMBER', // Default role, can be upgraded later
        region: 'CENTRAL',
      }
    })

    console.log(`Synced user to Prisma: ${user.email}`)
    console.log('User details:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      region: user.region
    })

    return user
  } catch (error) {
    console.error('Error syncing user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Usage: npx tsx scripts/sync-clerk-user.ts <clerkId> <email> <firstName> <lastName>
const [clerkId, email, firstName, lastName] = process.argv.slice(2)

if (!clerkId || !email || !firstName || !lastName) {
  console.log('Usage: npx tsx scripts/sync-clerk-user.ts <clerkId> <email> <firstName> <lastName>')
  console.log('Example: npx tsx scripts/sync-clerk-user.ts user_abc123 muyeyablessings@gmail.com Blessings Muyeya')
  process.exit(1)
}

syncClerkUser(clerkId, email, firstName, lastName)
