# Moderation

## Workflow

Each comment has a `status`: `pending`, `approved`, `spam`, or `trash`.

- With `requireApproval: true` (default), new comments are `pending` and hidden
  from the public `tree` endpoint until an admin approves them.
- With `requireApproval: false`, comments are `approved` immediately; admins can
  still move them to `spam` or `trash` afterwards.

## In the admin panel

Open the **Comments** collection. Use the `status` filter to find pending
comments, open one, and change its status in the sidebar. Only `approved`
comments are returned by the public API.

The author's email is stored for moderation but is never exposed by the public
API or to non-authenticated users.

## Reactions

Reactions on comments are never moderated — they apply immediately and are
de-duplicated per visitor (hashed IP + fingerprint). They live in the
**Comment Reactions** collection; `reactionCounts` on each comment is a
denormalized cache derived from it.

## Anti-spam

Built-in protections: honeypot field, per-IP rate limiting, min/max length, and
an optional link blocker (`blockLinks`). These are deterrents, not a guarantee;
for high-traffic sites consider fronting submission with a CAPTCHA or WAF.
