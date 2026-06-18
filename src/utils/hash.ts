import { createHash } from 'crypto'

/** One-way hash of a value with a salt. Returns empty string for empty input. */
export function hashWithSalt(value: string, salt: string): string {
  if (!value) return ''
  return createHash('sha256').update(`${salt}:${value}`).digest('hex')
}
