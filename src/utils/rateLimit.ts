export interface RateLimitConfig {
  windowMs: number
  max: number
}

export interface RateLimiter {
  /** Returns true if the request is allowed, false if it exceeds the limit. */
  check(key: string): boolean
}

/**
 * In-memory sliding-window rate limiter.
 * `clock` is injectable for testing; defaults to Date.now.
 */
export function createRateLimiter(config: RateLimitConfig, clock: () => number = () => Date.now()): RateLimiter {
  const hits = new Map<string, number[]>()
  return {
    check(key: string): boolean {
      const now = clock()
      const windowStart = now - config.windowMs
      const recent = (hits.get(key) ?? []).filter((t) => t > windowStart)
      if (recent.length >= config.max) {
        hits.set(key, recent)
        return false
      }
      recent.push(now)
      hits.set(key, recent)
      return true
    },
  }
}
