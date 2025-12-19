// Simple in-memory caching utility for API responses

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired items
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
      const cached = cache.get<T>(key)
      if (cached !== null) {
        resolve(cached)
        return
      }

      // If not in cache, execute function
      const result = await fn()
      
      // Store in cache
      cache.set(key, result, ttl)
      
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
  dashboardStats: (userId: string) => `user:${userId}:dashboard-stats`,
  loanEligibility: (userId: string, groupId: string) => `user:${userId}:loan-eligibility:${groupId}`,
}

// Periodic cleanup (run every 10 minutes)
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 10 * 60 * 1000)
}
