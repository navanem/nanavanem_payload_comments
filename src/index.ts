import type { Config } from 'payload'
import type { CommentsPluginOptions } from './types.js'
import { resolveOptions } from './defaults.js'
import { buildCommentsCollection } from './collections/Comments.js'
import { buildCommentReactionsCollection } from './collections/CommentReactions.js'
import { treeEndpoint } from './endpoints/treeEndpoint.js'
import { submitEndpoint } from './endpoints/submitEndpoint.js'
import { reactEndpoint } from './endpoints/reactEndpoint.js'

export type { CommentsPluginOptions, Reaction, CommentStatus } from './types.js'
export { DEFAULT_REACTIONS } from './defaults.js'

export const commentsPlugin =
  (pluginOptions: CommentsPluginOptions) =>
  (incomingConfig: Config): Config => {
    const options = resolveOptions(pluginOptions)
    const config = { ...incomingConfig }

    config.collections = [
      ...(config.collections ?? []),
      buildCommentsCollection(options),
      buildCommentReactionsCollection(options),
    ]

    // When disabled, still register collections (stable DB schema) but skip endpoints.
    if (options.disabled) return config

    config.endpoints = [
      ...(config.endpoints ?? []),
      treeEndpoint(options),
      submitEndpoint(options),
      reactEndpoint(options),
    ]

    return config
  }

export default commentsPlugin
