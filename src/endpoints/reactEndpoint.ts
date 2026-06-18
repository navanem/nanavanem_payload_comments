import type { Endpoint } from 'payload'
import type { ResolvedOptions } from '../types.js'
export function reactEndpoint(_options: ResolvedOptions): Endpoint {
  return { path: '/comments/:id/react', method: 'post', handler: () => Response.json({ ok: true }) }
}
