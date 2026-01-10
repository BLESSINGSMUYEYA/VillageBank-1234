import { PrismaClient, Prisma } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// Ensure the DATABASE_URL is explicitly checked
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is missing from environment variables.')
}

// Helper to get database URL
const getDatabaseUrl = () => {
  return process.env.DATABASE_URL
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

const prismaClientSingleton = () => {
  return new PrismaClient(prismaClientOptions)
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export type { MemberStatus } from '@prisma/client'
