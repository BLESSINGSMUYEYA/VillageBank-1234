import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure the DATABASE_URL is explicitly checked
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is missing from environment variables.')
}

// Helper to get database URL with connection pool settings
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) return url

  // Only append if it looks like a connection string and doesn't already have the settings
  try {
    const urlObj = new URL(url)
    let changed = false

    if (!urlObj.searchParams.has('connection_limit')) {
      // Set to 10 to avoid exhausting database connection limits in development
      urlObj.searchParams.set('connection_limit', '10')
      changed = true
    }
    if (!urlObj.searchParams.has('pool_timeout')) {
      urlObj.searchParams.set('pool_timeout', '30')
      changed = true
    }

    return changed ? urlObj.toString() : url
  } catch (e) {
    // If not a valid URL (e.g. mock or special string), return as is
    return url
  }
}

// Build connection options
const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: ['error', 'warn'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export type { MemberStatus } from '@prisma/client'
