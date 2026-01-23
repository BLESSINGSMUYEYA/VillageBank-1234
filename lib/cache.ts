// Caching utility with Redis (when available) and in-memory fallback
// Redis is now configured via UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

import { Redis } from '@upstash/redis'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

// Initialize Redis client if credentials are available
let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  console.log('✅ Redis cache enabled')
} else {
  console.log('⚠️ Redis not configured, using in-memory cache')
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()

  async set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): Promise<void> {
    // Try Redis first
    if (redis) {
      try {
        await redis.setex(key, Math.floor(ttl / 1000), JSON.stringify(data))
        return
      } catch (error) {
        console.error('Redis set error, falling back to memory:', error)
      }
    }

    // Fallback to in-memory
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  async get<T>(key: string): Promise<T | null> {
    // Try Redis first
    if (redis) {
      try {
        const cached = await redis.get(key)
        if (cached) {
          return (typeof cached === 'string' ? JSON.parse(cached) : cached) as T
        }
      } catch (error) {
        console.error('Redis get error, falling back to memory:', error)
      }
    }

    // Fallback to in-memory
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  async delete(key: string): Promise<boolean> {
    // Try Redis first
    if (redis) {
      try {
        await redis.del(key)
      } catch (error) {
        console.error('Redis delete error:', error)
      }
    }

    // Also delete from in-memory cache
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    // Note: We don't clear Redis as it might be shared
  }

  // Clean up expired items (in-memory only)
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new MemoryCache()

// Cache wrapper for API functions
export function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try to get from cache first
      const cached = await cache.get<T>(key)
      if (cached !== null) {
        resolve(cached)
        return
      }

      // If not in cache, execute function
      const result = await fn()

      // Store in cache
      await cache.set(key, result, ttl)

      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

// Cache key generators
export const cacheKeys = {
  userGroups: (userId: string) => `user:${userId}:groups`,
  userContributions: (userId: string) => `user:${userId}:contributions`,
  userLoans: (userId: string) => `user:${userId}:loans`,
  groupDetails: (groupId: string) => `group:${groupId}:details`,
  groupMembers: (groupId: string) => `group:${groupId}:members`,
  dashboardStats: (userId: string) => `dashboard:${userId}:stats`,
  dashboardActivity: (userId: string) => `dashboard:${userId}:activity`,
  dashboardCharts: (userId: string) => `dashboard:${userId}:charts`,
  dashboardApprovals: (userId: string) => `dashboard:${userId}:approvals`,
  loanEligibility: (userId: string, groupId: string) => `user:${userId}:loan-eligibility:${groupId}`,
}

// Cache invalidation helpers
export function invalidateUserCache(userId: string): void {
  // Invalidate all user-related caches
  const patterns = [
    `user:${userId}:`,
    `dashboard:${userId}:`,
  ]

  patterns.forEach(pattern => {
    // Get all keys and delete matching ones
    for (const key of Array.from((cache as any).cache.keys()) as string[]) {
      if (key.startsWith(pattern)) {
        cache.delete(key)
      }
    }
  })
}

export async function invalidateDashboardCache(userId: string): Promise<void> {
  await cache.delete(cacheKeys.dashboardStats(userId))
  await cache.delete(cacheKeys.dashboardActivity(userId))
  await cache.delete(cacheKeys.dashboardCharts(userId))
  await cache.delete(cacheKeys.dashboardApprovals(userId))
}

export function invalidateGroupCache(groupId: string): void {
  cache.delete(cacheKeys.groupDetails(groupId))
  cache.delete(cacheKeys.groupMembers(groupId))
}

// Periodic cleanup (run every 10 minutes)
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 10 * 60 * 1000)
}
