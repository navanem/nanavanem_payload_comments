import { describe, it, expect } from 'vitest'
import { hashWithSalt } from '../src/utils/hash.js'

describe('hashWithSalt', () => {
  it('produces a stable hex hash for the same input + salt', () => {
    const a = hashWithSalt('1.2.3.4', 'salt')
    const b = hashWithSalt('1.2.3.4', 'salt')
    expect(a).toBe(b)
    expect(a).toMatch(/^[a-f0-9]{64}$/)
  })

  it('changes when the salt changes', () => {
    expect(hashWithSalt('1.2.3.4', 'saltA')).not.toBe(hashWithSalt('1.2.3.4', 'saltB'))
  })

  it('returns empty string for empty input', () => {
    expect(hashWithSalt('', 'salt')).toBe('')
  })
})
