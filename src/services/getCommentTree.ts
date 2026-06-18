import type { Payload } from 'payload'
import type { ResolvedOptions } from '../types.js'

export interface PublicComment {
  id: string
  content: string
  authorName: string
  mood: string | null
  depth: number
  reactionCounts: Record<string, number>
  createdAt: string
  replies: PublicComment[]
}

export interface TreeQuery {
  relationTo: string
  docId: string
}

/** Fetch approved comments for a document and assemble them into a nested tree (public-safe fields only). */
export async function getCommentTree(
  payload: Payload,
  options: ResolvedOptions,
  query: TreeQuery,
): Promise<PublicComment[]> {
  // Polymorphic relationship values are stored as the collection's integer id, so a
  // numeric-string docId must be coerced to a number to match (mirror submitComment).
  const docValue = /^\d+$/.test(query.docId) ? Number(query.docId) : query.docId

  const { docs } = await payload.find({
    collection: options.commentsSlug,
    where: {
      and: [
        { status: { equals: 'approved' } },
        { 'relatedDoc.relationTo': { equals: query.relationTo } },
        { 'relatedDoc.value': { equals: docValue } },
      ],
    },
    sort: 'createdAt',
    limit: 0,
    depth: 0,
    overrideAccess: true,
  })

  const nodes = new Map<string, PublicComment>()
  const roots: PublicComment[] = []

  for (const doc of docs) {
    nodes.set(String(doc.id), {
      id: String(doc.id),
      content: doc.content,
      authorName: doc.authorName,
      mood: doc.mood ?? null,
      depth: typeof doc.depth === 'number' ? doc.depth : 0,
      reactionCounts: (doc.reactionCounts as Record<string, number>) ?? {},
      createdAt: doc.createdAt,
      replies: [],
    })
  }

  for (const doc of docs) {
    const node = nodes.get(String(doc.id))!
    const rawParent = doc.parent
    const parentId =
      rawParent == null
        ? null
        : typeof rawParent === 'object'
          ? String(rawParent.id)
          : String(rawParent)
    if (parentId && nodes.has(parentId)) {
      nodes.get(parentId)!.replies.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
