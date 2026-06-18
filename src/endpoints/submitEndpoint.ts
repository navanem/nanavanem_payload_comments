import type { Endpoint } from 'payload'
import type { ResolvedOptions } from '../types.js'
export function submitEndpoint(_options: ResolvedOptions): Endpoint {
  return { path: '/comments/submit', method: 'post', handler: () => Response.json({ ok: true }) }
}
