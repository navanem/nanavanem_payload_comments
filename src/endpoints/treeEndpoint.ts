import type { Endpoint } from 'payload'
import type { ResolvedOptions } from '../types.js'
export function treeEndpoint(_options: ResolvedOptions): Endpoint {
  return { path: '/comments/tree', method: 'get', handler: () => Response.json({ comments: [] }) }
}
