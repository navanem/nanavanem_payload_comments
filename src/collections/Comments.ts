import type { CollectionConfig, CollectionSlug } from 'payload'
import type { ResolvedOptions } from '../types.js'
import { setStatusDefault } from '../hooks/setStatusDefault.js'
import { setDepth } from '../hooks/setDepth.js'

/** Build the comments collection from resolved plugin options. */
export function buildCommentsCollection(options: ResolvedOptions): CollectionConfig {
  return {
    slug: options.commentsSlug,
    labels: { singular: 'Comment', plural: 'Comments' },
    admin: {
      useAsTitle: 'authorName',
      defaultColumns: ['authorName', 'content', 'thread', 'relatedDoc', 'status', 'createdAt'],
      group: 'Comments',
    },
    access: {
      // Public reads are served through the /tree endpoint with overrideAccess.
      // Direct collection reads: only approved are public; logged-in admins see all.
      read: ({ req: { user } }) => {
        if (user) return true
        return { status: { equals: 'approved' } }
      },
      // Creation is endpoint-only to enforce anti-spam.
      create: ({ req: { user } }) => Boolean(user),
      update: ({ req: { user } }) => Boolean(user),
      delete: ({ req: { user } }) => Boolean(user),
    },
    fields: [
      { name: 'content', type: 'textarea', required: true },
      { name: 'authorName', type: 'text', required: true },
      {
        // Virtual (not stored): a moderation-list label distinguishing a top-level
        // comment from a reply, with the parent author. Computed only for admin
        // reads — the public /tree endpoint reads with no user, so it never runs
        // there (no extra query, nothing added to the public payload).
        name: 'thread',
        type: 'text',
        virtual: true,
        label: 'Thread',
        admin: {
          readOnly: true,
          position: 'sidebar',
          description: 'Top-level comment or a reply (shown in the moderation list).',
        },
        hooks: {
          afterRead: [
            async ({ data, req }) => {
              if (!req?.user) return undefined
              const depth = Number((data as { depth?: unknown })?.depth ?? 0)
              const parent = (data as { parent?: unknown })?.parent
              if (!parent && depth <= 0) return 'Top-level'
              let who = ''
              try {
                const pid = parent && typeof parent === 'object' ? (parent as { id?: unknown }).id : parent
                if (pid != null) {
                  const p = await req.payload.findByID({
                    collection: options.commentsSlug as CollectionSlug,
                    id: pid as string | number,
                    depth: 0,
                    overrideAccess: true,
                  })
                  const name = (p as { authorName?: string } | null)?.authorName
                  if (name) who = ` to ${name}`
                }
              } catch {
                /* parent removed */
              }
              return `↳ Reply${who}`
            },
          ],
        },
      },
      {
        name: 'authorEmail',
        type: 'email',
        required: options.requireEmail,
        access: {
          // Never expose author email to the public API.
          read: ({ req: { user } }) => Boolean(user),
        },
        admin: { description: 'Stored for moderation; never exposed publicly.' },
      },
      {
        name: 'mood',
        type: 'select',
        options: options.reactions.map((r) => ({ label: `${r.emoji} ${r.label}`, value: r.key })),
        admin: { description: "The author's reaction icon attached to this comment." },
      },
      {
        name: 'status',
        type: 'select',
        defaultValue: options.requireApproval ? 'pending' : 'approved',
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Spam', value: 'spam' },
          { label: 'Trash', value: 'trash' },
        ],
        index: true,
        admin: { position: 'sidebar' },
      },
      {
        name: 'relatedDoc',
        type: 'relationship',
        relationTo: options.enabledCollections,
        required: true,
        index: true,
        admin: { position: 'sidebar' },
      },
      {
        name: 'parent',
        type: 'relationship',
        relationTo: options.commentsSlug as CollectionSlug,
        admin: { position: 'sidebar', description: 'Parent comment, if this is a reply.' },
      },
      {
        name: 'depth',
        type: 'number',
        defaultValue: 0,
        admin: { readOnly: true, position: 'sidebar' },
      },
      {
        name: 'reactionCounts',
        type: 'json',
        defaultValue: {},
        admin: { readOnly: true, description: 'Denormalized counts per reaction key.' },
      },
      { name: 'ipHash', type: 'text', admin: { readOnly: true, hidden: true } },
      { name: 'fingerprintHash', type: 'text', admin: { readOnly: true, hidden: true } },
    ],
    hooks: {
      beforeChange: [
        setStatusDefault(options.requireApproval),
        setDepth(options.commentsSlug, options.maxDepth),
      ],
    },
  }
}
