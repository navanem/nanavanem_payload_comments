import { describe, it, expect } from 'vitest'
import { createRateLimiter } from '../src/utils/rateLimit.js'

describe('createRateLimiter', () => {
  it('allows up to max requests in the window then blocks', () => {
    let now = 1000
    const clock = () => now
    const limiter = createRateLimiter({ windowMs: 1000, max: 2 }, clock)
    expect(limiter.check('k')).toBe(true)
    expect(limiter.check('k')).toBe(true)
    expect(limiter.check('k')).toBe(false)
  })

  it('resets after the window elapses', () => {
    let now = 1000
    const clock = () => now
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 }, clock)
    expect(limiter.check('k')).toBe(true)
    expect(limiter.check('k')).toBe(false)
    now = 2500
    expect(limiter.check('k')).toBe(true)
  })

  it('tracks keys independently', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 }, () => 0)
    expect(limiter.check('a')).toBe(true)
    expect(limiter.check('b')).toBe(true)
    expect(limiter.check('a')).toBe(false)
  })
})
