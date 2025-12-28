import { PrismaClient, MemberStatus } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced DATABASE_URL with connection pooling
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment variables')
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  errorFormat: 'pretty',
  // Add connection pool configuration
  // @ts-ignore - Prisma doesn't expose these types but they work
  __internal: {
    engine: {
      connection_limit: 10,  // Reduced from default 20 to prevent pool exhaustion
      pool_timeout: 30,      // Timeout for acquiring connection from pool
    },
  },
})

// Graceful shutdown handler
process.on('beforeExit', async () => {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error disconnecting from database:', error)
  }
})

process.on('SIGINT', async () => {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error disconnecting from database:', error)
  }
  process.exit(0)
})

process.on('SIGTERM', async () => {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error disconnecting from database:', error)
  }
  process.exit(0)
})

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error)
  try {
    await prisma.$disconnect()
  } catch (disconnectError) {
    console.error('Error disconnecting from database during uncaught exception:', disconnectError)
  }
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  try {
    await prisma.$disconnect()
  } catch (disconnectError) {
    console.error('Error disconnecting from database during unhandled rejection:', disconnectError)
  }
  process.exit(1)
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export type { MemberStatus } from '@prisma/client'
