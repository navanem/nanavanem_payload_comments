# Configuration

`commentsPlugin(options)` accepts:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabledCollections` | `string[]` | — (required) | Collections whose documents can be commented on. |
| `requireApproval` | `boolean` | `true` | New comments start as `pending` and stay hidden until approved. |
| `requireEmail` | `boolean` | `false` | Require an email when submitting. |
| `maxDepth` | `1 \| 2 \| 3` | `3` | Maximum reply nesting depth. |
| `reactions` | `Reaction[]` | 6 defaults | Emoji set for both comment mood and reactions. |
| `maxLength` | `number` | `2000` | Maximum content length. |
| `minLength` | `number` | `2` | Minimum content length. |
| `blockLinks` | `boolean` | `false` | Reject comments containing URLs. |
| `rateLimit` | `{ windowMs, max }` | `{ 60000, 5 }` | Per-IP sliding-window submit limit. |
| `commentsSlug` | `string` | `'comments'` | Slug for the comments collection. |
| `reactionsSlug` | `string` | `'comment-reactions'` | Slug for the reactions collection. |
| `ipSalt` | `string` | `COMMENTS_IP_SALT` env | Salt used to hash IPs/fingerprints. |
| `disabled` | `boolean` | `false` | Register collections but skip endpoints. |

## Reaction shape

```ts
interface Reaction {
  key: string   // stored value, e.g. "like"
  emoji: string // shown in UI, e.g. "👍"
  label: string // accessibility label
}
```

The same set is used for the comment author's "mood" and for reactions on comments.

## Privacy

IP addresses and browser fingerprints are never stored in clear text — only
salted SHA-256 hashes, used for reaction de-duplication and rate limiting.
Set a stable, secret `COMMENTS_IP_SALT`.
