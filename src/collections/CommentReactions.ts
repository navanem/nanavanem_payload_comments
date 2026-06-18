import type { CollectionConfig, CollectionSlug } from 'payload'
import type { ResolvedOptions } from '../types.js'

/** Build the reactions collection (source of truth for reactions on comments). */
export function buildCommentReactionsCollection(options: ResolvedOptions): CollectionConfig {
  return {
    slug: options.reactionsSlug,
    labels: { singular: 'Comment Reaction', plural: 'Comment Reactions' },
    admin: {
      useAsTitle: 'emoji',
      defaultColumns: ['comment', 'emoji', 'createdAt'],
      group: 'Comments',
      // Reactions are operational data; keep them out of the main nav clutter.
      hidden: false,
    },
    access: {
      read: ({ req: { user } }) => Boolean(user),
      create: ({ req: { user } }) => Boolean(user),
      update: ({ req: { user } }) => Boolean(user),
      delete: ({ req: { user } }) => Boolean(user),
    },
    fields: [
      {
        name: 'comment',
        type: 'relationship',
        relationTo: options.commentsSlug as CollectionSlug,
        required: true,
        index: true,
      },
      { name: 'emoji', type: 'text', required: true },
      { name: 'ipHash', type: 'text', index: true },
      { name: 'fingerprintHash', type: 'text', index: true },
    ],
  }
}
