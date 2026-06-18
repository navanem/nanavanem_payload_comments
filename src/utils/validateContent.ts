export interface ValidationRules {
  minLength: number
  maxLength: number
  blockLinks: boolean
}

export interface SubmissionInput {
  content: string
  honeypot: string
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: 'spam' | 'too_short' | 'too_long' | 'links_not_allowed' }

const LINK_PATTERN = /(https?:\/\/|www\.)/i

export function validateSubmission(input: SubmissionInput, rules: ValidationRules): ValidationResult {
  if (input.honeypot && input.honeypot.trim() !== '') return { ok: false, reason: 'spam' }
  const content = input.content?.trim() ?? ''
  if (content.length < rules.minLength) return { ok: false, reason: 'too_short' }
  if (content.length > rules.maxLength) return { ok: false, reason: 'too_long' }
  if (rules.blockLinks && LINK_PATTERN.test(content)) return { ok: false, reason: 'links_not_allowed' }
  return { ok: true }
}
