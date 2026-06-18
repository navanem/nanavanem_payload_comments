# @navanem/payload-comments — Design

**Date:** 2026-06-18
**Statut:** Validé, prêt pour planification d'implémentation
**Cible:** Payload 3.x

## Objectif

Un plugin Payload de gestion de commentaires « façon Thrive Comments », mais
idiomatique Payload et déployable facilement sur n'importe quel projet Payload 3.x.

Périmètre v1 (sans authentification) :

- N'importe qui peut laisser un commentaire (nom + email) avec une icône-réaction
  (« humeur ») attachée à son propre commentaire.
- N'importe qui peut réagir à un commentaire existant via un jeu d'emojis.
- Validation/modération activable ou non avant publication.
- Réponses imbriquées, **3 niveaux maximum**.
- Anti-spam minimal natif.
- Composant front React prêt à l'emploi, plus guide d'intégration front dans la doc.

## 1. Architecture

Package npm scoped **`@navanem/payload-comments`** (TypeScript), basé sur la
structure du *plugin template* officiel Payload :

- `src/` — code du plugin
- `dev/` — mini-app Payload pour développer et tester en local

Le plugin est une fonction `commentsPlugin(options)` qui retourne
`(config) => config` et injecte collections, endpoints, contrôle d'accès et hooks
sans casser la config hôte. Respecte `disabled: true` (no-op), convention Payload.

Stratégie de distribution : package préparé pour npm (build, exports propres),
installable via Git en attendant une éventuelle publication.

**Exports du package :**

- `@navanem/payload-comments` → la fonction plugin (back-end)
- `@navanem/payload-comments/client` → le composant React `<Comments />` (`'use client'`)
- `@navanem/payload-comments/types` → types partagés

`payload`, `react`, `next` sont en **peerDependencies**.

## 2. Modèle de données

### Collection `comments` (slug configurable via `commentsSlug`)

| Champ | Type | Notes |
|-------|------|-------|
| `content` | textarea | requis, longueur min/max |
| `authorName` | text | requis |
| `authorEmail` | email | lecture **admin uniquement**, jamais exposé au public ; requis si `requireEmail` |
| `mood` | select | jeu d'emojis = réaction (A) attachée par l'auteur à son commentaire |
| `status` | select | `pending \| approved \| spam \| trash`, défaut selon `requireApproval` |
| `relatedDoc` | relation polymorphe | `relationTo: enabledCollections` + `value` |
| `parent` | relation → `comments` (self) | threading |
| `depth` | number | 0–2 (3 niveaux max), calculé et **validé** côté serveur |
| `reactionCounts` | json/group | compteurs dénormalisés par emoji (cache lecture rapide) |
| `ipHash` | text | hashé avec sel, jamais d'IP en clair, admin only |
| `fingerprintHash` | text | hashé avec sel, admin only |

### Collection `comment-reactions` (légère, groupée dans l'admin)

Champs : `comment`, `emoji`, `ipHash`, `fingerprintHash`.

Source de vérité pour les réactions (B) ; permet la déduplication et le recalcul
des compteurs. `comments.reactionCounts` est un cache dérivé de cette collection.

## 3. Endpoints publics (REST custom)

- `GET /api/comments/tree?relationTo=&docId=` — arbre des commentaires **approuvés**
  uniquement (≤ 3 niveaux), `authorEmail` exclu de la réponse.
- `POST /api/comments/submit` — dépôt anonyme : honeypot, rate-limit par `ipHash`,
  longueur min/max, blocage de liens optionnel, validation de profondeur. Retourne
  le commentaire publié, ou un message « en attente de modération ».
- `POST /api/comments/:id/react` — ajoute/retire une réaction (B), dédupliquée par
  `ipHash + fingerprintHash`, met à jour `reactionCounts`. Toujours immédiat (non modéré).

La création directe via l'API REST standard de la collection est **fermée au public** :
le dépôt passe obligatoirement par `/submit` pour garantir l'anti-spam.

## 4. Contrôle d'accès & anti-spam

**Accès :**

- `read` public : uniquement `status = approved`. Admins : tout.
- `create` : désactivé pour le public (endpoint only).
- `update` / `delete` : admins seulement.

**Anti-spam natif v1 :**

- Honeypot (champ caché).
- Rate-limiting par `ipHash` (fenêtre + max configurables, store en mémoire).
- Longueur min/max du contenu.
- Blocage de liens optionnel.
- Hashing IP/empreinte avec sel (`ipSalt` ou variable d'environnement) — aucune IP
  en clair stockée.
- Honnête sur ses limites : dissuasif sans login, pas infaillible. Pas de service
  tiers (Akismet, etc.) en v1.

## 5. Options de configuration

```ts
commentsPlugin({
  enabledCollections: ['posts', 'pages'], // requis
  requireApproval: true,        // défaut true → nouveaux commentaires en `pending`
  requireEmail: false,
  maxDepth: 3,                  // 1..3
  reactions: DEFAULT_REACTIONS, // 👍 ❤️ 😂 😮 😢 👎, surchargeable
  maxLength: 2000,
  minLength: 2,
  blockLinks: false,
  rateLimit: { windowMs: 60000, max: 5 },
  commentsSlug: 'comments',     // évite les collisions
  ipSalt: process.env.COMMENTS_IP_SALT,
  disabled: false,
})
```

Le même jeu `reactions` sert pour l'humeur (A) et pour les réactions aux
commentaires (B).

## 6. Composant front `<Comments />`

Composant React client (`'use client'`) stylé, déposable dans un front Next.js :

```tsx
<Comments serverURL="https://exemple.com" relationTo="posts" docId={post.id} />
```

Gère : récupération de l'arbre, affichage imbriqué (≤ 3 niveaux), formulaire de
dépôt (nom, email si requis, texte, sélecteur d'humeur, honeypot caché), boutons
de réaction sur chaque commentaire.

- **Sans dépendance lourde.**
- Styles via CSS Modules + variables CSS surchargeables (thématisable).
- Optionnel : l'intégrateur peut tout reconstruire à partir des endpoints.

## 7. Fidélité visuelle admin

S'appuie sur les **types de champs et composants natifs Payload** : select à badges
pour le statut, filtres de liste, groupes de champs, colonnes de liste
personnalisées. Pas de surcouche UI exotique. La vue « Comments » offre un filtre
par statut et les actions approuver / spam / trash via les mécanismes natifs.
`comment-reactions` est rangée dans un groupe admin pour ne pas encombrer.

## 8. Structure du repo

```
src/                 # plugin (collections, endpoints, access, hooks, utils, client)
dev/                 # mini-app Payload de dev/test
docs/                # configuration.md, frontend-integration.md, moderation.md
docs/superpowers/specs/  # ce design
README.md            # install + quickstart + lien vers docs
CHANGELOG.md         # Keep a Changelog, SemVer, démarrage v0.1.0
.gitignore           # node_modules, dist, .env, etc.
LICENSE              # MIT
package.json         # exports map, peerDeps, scripts build (tsc)
```

## 9. Tests

Tests d'intégration sur l'app `dev/` (approche TDD) couvrant au minimum :

- Profondeur ≤ 3 imposée (rejet au-delà).
- Défauts de statut selon `requireApproval`.
- Déduplication des réactions par `ipHash + fingerprintHash`.
- Anti-spam (honeypot, rate-limit, longueur, liens).
- Accès : public ne voit que `approved`, `authorEmail` jamais exposé.

## 10. Versioning & conventions

- **SemVer** + `CHANGELOG.md` (format Keep a Changelog), tags git `vX.Y.Z`,
  démarrage en `0.1.0`.
- **Licence : MIT.**
- **Commits :** auteur `navanem <tools@sunitech.ch>`. Aucune référence à
  Claude/Anthropic dans le code, les commentaires, le README, le CHANGELOG, ni en
  co-auteur.

## Hors périmètre v1 (futur)

- Authentification / commentaires liés à des membres.
- Notifications email, Gravatar.
- Services anti-spam tiers (Akismet).
- Widget JS embarquable hors Next (`<script>` + iframe).
