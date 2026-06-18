import { describe, it, expect } from 'vitest'
import { validateSubmission } from '../src/utils/validateContent.js'

const base = { minLength: 2, maxLength: 100, blockLinks: false }

describe('validateSubmission', () => {
  it('accepts valid content', () => {
    expect(validateSubmission({ content: 'Hello', honeypot: '' }, base)).toEqual({ ok: true })
  })

  it('rejects when honeypot is filled', () => {
    expect(validateSubmission({ content: 'Hello', honeypot: 'bot' }, base)).toEqual({
      ok: false,
      reason: 'spam',
    })
  })

  it('rejects content shorter than minLength', () => {
    expect(validateSubmission({ content: 'a', honeypot: '' }, base)).toEqual({
      ok: false,
      reason: 'too_short',
    })
  })

  it('rejects content longer than maxLength', () => {
    const long = 'a'.repeat(101)
    expect(validateSubmission({ content: long, honeypot: '' }, base)).toEqual({
      ok: false,
      reason: 'too_long',
    })
  })

  it('rejects links when blockLinks is true', () => {
    expect(
      validateSubmission({ content: 'see http://x.com', honeypot: '' }, { ...base, blockLinks: true }),
    ).toEqual({ ok: false, reason: 'links_not_allowed' })
  })

  it('allows links when blockLinks is false', () => {
    expect(validateSubmission({ content: 'see http://x.com', honeypot: '' }, base)).toEqual({ ok: true })
  })
})
