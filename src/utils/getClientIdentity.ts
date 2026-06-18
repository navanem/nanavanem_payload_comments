import { hashWithSalt } from './hash.js'

interface IdentitySource {
  headers: Headers
  body?: { fingerprint?: string } | unknown
}

export interface ClientIdentity {
  ipHash: string
  fingerprintHash: string
}

/** Extract and hash the client IP (from proxy headers) and the optional fingerprint from the body. */
export function getClientIdentity(req: IdentitySource, salt: string): ClientIdentity {
  const forwarded = req.headers.get('x-forwarded-for') ?? ''
  const realIp = req.headers.get('x-real-ip') ?? ''
  const ip = (forwarded.split(',')[0]?.trim() || realIp || '').trim()
  const body = (req.body ?? {}) as { fingerprint?: string }
  const fingerprint = typeof body.fingerprint === 'string' ? body.fingerprint : ''
  return {
    ipHash: hashWithSalt(ip, salt),
    fingerprintHash: hashWithSalt(fingerprint, salt),
  }
}
