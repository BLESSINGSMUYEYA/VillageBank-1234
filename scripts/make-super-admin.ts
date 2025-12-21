// Temporarily disable Prisma imports until client is properly generated
// import { PrismaClient } from '@prisma/client'
import { prisma } from '../lib/prisma';

const prismaClient = prisma

async function makeSuperAdmin(email: string) {
  try {
    const user = await prismaClient.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log(`User with email ${email} not found`)
      return
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'SUPER_ADMIN' }
    })

    console.log(`User ${updatedUser.email} is now a SUPER_ADMIN`)
    console.log('User details:', {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      region: updatedUser.region
    })
  } catch (error) {
    console.error('Error updating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// List all users first
async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    })

    console.log('All users in database:')
    users.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - Role: ${user.role}`)
    })

    return users
  } catch (error) {
    console.error('Error listing users:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

// If run with email argument, make that user super admin
// Otherwise, list all users
const email = process.argv[2]

if (email) {
  makeSuperAdmin(email)
} else {
  listUsers()
}
