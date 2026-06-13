# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript (node ace build)
npm start            # Run production build

# Code quality
npm run lint         # ESLint
npm run format       # Prettier
npm run typecheck    # tsc --noEmit

# Tests
npm run test                                          # All tests
node ace test tests/functional/auth.spec.ts           # Single test file

# Database
node ace migration:run
node ace migration:rollback
```

## Architecture

**Multi-tenant SaaS API** built on AdonisJS 7 (TypeScript). Every request must include an `x-site-id` header identifying the tenant.

### Request lifecycle

`SiteMiddleware` (`app/middleware/site_middleware.ts`) validates the `x-site-id` header and attaches `ctx.site`. Routes bypassed by this middleware are declared explicitly (e.g., the public Mailjet TXT validation route). After site resolution, `auth`/`silent_auth` middleware attaches `ctx.auth.user`.

Named middleware guards:
- `auth` — requires authenticated user
- `adminSite` — requires site owner role
- `enrolledUser` — requires active enrollment in the current site

### Route structure (`start/routes.ts`)

| Prefix | Purpose |
|--------|---------|
| `/auth` | Register, login, Google OAuth, email verification, token refresh |
| `/content` | Public content reads (posts by slug, attachments) |
| `/social` | Comment/topic creation and reads (authenticated) |
| `/admin` | Site management, content CRUD, moderation (owner only) |

### Domain modules

- **Auth** — email+password, Google OAuth via `@adonisjs/ally`, signed URL email verification (24h), API token issuance
- **Content** — Posts (markdown/html/plaintext, publish/draft), file attachments to S3/Spaces (max 10 MB), custom key-value post attributes
- **Social** — Threaded comments (`parent_id`), topics, replies, moderation queue

### Data model

`Site` is the tenant container. `Enrollment` links `User` to `Site` with a role (`owner` | `user`). User emails are globally unique across sites. See `DOCUMENTATION.md` for full ER diagrams and API reference.

### Key config files

| File | Purpose |
|------|---------|
| `adonisrc.ts` | Commands, providers, preloads, test suites |
| `config/database.ts` | MySQL (primary) / SQLite (fallback) |
| `config/auth.ts` | API token guards |
| `config/ally.ts` | Google OAuth |
| `config/drive.ts` | S3/DigitalOcean Spaces |
| `config/cors.ts` | Allowed origins |

### Testing

Tests use Japa with `@japa/api-client` for functional HTTP tests. `tests/bootstrap.ts` starts a full HTTP server and configures `dbAssertions`, `authApiClient`, and `sessionApiClient` helpers.

Unit tests have a 2 s timeout; functional tests have a 30 s timeout.

### Deployment

Docker multi-stage build (Alpine). `docker-compose.yml` wires MySQL + nginx-proxy + acme-companion. See `README.md` for deployment steps.
