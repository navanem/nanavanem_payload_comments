import { describe, it, expect } from 'vitest'
import { getClientIdentity } from '../src/utils/getClientIdentity.js'

function reqWith(headers: Record<string, string>, fingerprint?: string) {
  return {
    headers: new Headers(headers),
    body: fingerprint ? { fingerprint } : {},
  }
}

describe('getClientIdentity', () => {
  it('reads ip from x-forwarded-for (first entry) and hashes it', () => {
    const id = getClientIdentity(reqWith({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' }), 'salt')
    expect(id.ipHash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('hashes the fingerprint from the body', () => {
    const id = getClientIdentity(reqWith({}, 'fp-123'), 'salt')
    expect(id.fingerprintHash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('returns empty hashes when nothing is available', () => {
    const id = getClientIdentity(reqWith({}), 'salt')
    expect(id.ipHash).toBe('')
    expect(id.fingerprintHash).toBe('')
  })
})
