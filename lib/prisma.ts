import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure the DATABASE_URL is explicitly checked
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is missing from environment variables.')
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export type { MemberStatus } from '@prisma/client'
