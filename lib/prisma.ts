import { PrismaClient, MemberStatus } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced DATABASE_URL with connection pooling
const databaseUrl = process.env.DATABASE_URL || ""

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { MemberStatus }
