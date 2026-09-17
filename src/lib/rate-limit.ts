export interface RateLimitConfig {
  windowMs: number
  maxAttempts: number
  lockDurationMs: number
}

interface RateLimitEntry {
  attempts: number[]
  blockedUntil: number | null
}

export interface RateLimitResult {
  allowed: boolean
  retryAfterMs?: number
}

export function createRateLimiter<Key extends string>(config: RateLimitConfig) {
  const store = new Map<Key, RateLimitEntry>()

  function check(key: Key): RateLimitResult {
    const now = Date.now()
    const entry = store.get(key)

    if (entry) {
      if (entry.blockedUntil !== null && entry.blockedUntil > now) {
        return { allowed: false, retryAfterMs: entry.blockedUntil - now }
      }
      if (entry.blockedUntil !== null && entry.blockedUntil <= now) {
        entry.blockedUntil = null
      }
      entry.attempts = entry.attempts.filter((timestamp) => now - timestamp < config.windowMs)
      if (entry.attempts.length >= config.maxAttempts) {
        entry.blockedUntil = now + config.lockDurationMs
        entry.attempts = []
        return { allowed: false, retryAfterMs: config.lockDurationMs }
      }
      entry.attempts.push(now)
      return { allowed: true }
    }

    store.set(key, { attempts: [now], blockedUntil: null })
    return { allowed: true }
  }

  function reset(key: Key): void {
    store.delete(key)
  }

  function clearExpired(): void {
    const now = Date.now()
    for (const [key, entry] of store) {
      const expired =
        entry.attempts.length === 0 &&
        (entry.blockedUntil === null || entry.blockedUntil <= now)
      if (expired) store.delete(key)
    }
  }

  return { check, reset, clearExpired }
}

export const AUTH_RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  lockDurationMs: 15 * 60 * 1000,
}