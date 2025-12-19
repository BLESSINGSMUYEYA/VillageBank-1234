import { PrismaClient, MemberStatus } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced DATABASE_URL with connection pooling
const databaseUrl = process.env.DATABASE_URL || ""

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: databaseUrl.includes("?") 
        ? `${databaseUrl}&connection_limit=20&pool_timeout=30`
        : `${databaseUrl}?connection_limit=20&pool_timeout=30`,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { MemberStatus }
