# @navanem/payload-comments

Anonymous comments and reactions for Payload 3.x — with optional pre-publish
moderation, mood emojis, reactions on comments, and up to 3 levels of replies.

## Features

- Anyone can comment (name + optional/required email) with a mood emoji.
- React to existing comments with a configurable emoji set.
- Optional approval workflow before comments are published.
- Up to 3 levels of nested replies.
- Built-in lightweight anti-spam (honeypot, rate limiting, length/link rules).
- Ready-to-use `<Comments />` React component, or build your own on the REST API.

## Install

```bash
pnpm add @navanem/payload-comments
# or from Git until published:
pnpm add github:navanem/nanavanem_payload_comments
```

`payload`, `react` and `react-dom` are peer dependencies.

## Quick start

```ts
// payload.config.ts
import { commentsPlugin } from '@navanem/payload-comments'

export default buildConfig({
  // ...
  plugins: [
    commentsPlugin({
      enabledCollections: ['posts', 'pages'],
      requireApproval: true,
      requireEmail: false,
    }),
  ],
})
```

Set a salt for IP hashing in your environment:

```bash
COMMENTS_IP_SALT="a-long-random-string"
```

## Front-end

```tsx
import { Comments } from '@navanem/payload-comments/client'

export default function PostPage({ post }) {
  return <Comments relationTo="posts" docId={post.id} />
}
```

See [docs/frontend-integration.md](docs/frontend-integration.md) for props, styling and a no-component (raw API) integration.

## Documentation

- [Configuration](docs/configuration.md)
- [Front-end integration](docs/frontend-integration.md)
- [Moderation](docs/moderation.md)

## License

MIT © navanem
