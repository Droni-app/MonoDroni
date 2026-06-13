# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Type-check (vue-tsc) then build with Vite
npm run preview    # Preview production build locally
```

No test runner is configured.

## Environment

Copy `.env.example` to `.env` and set:

```
VITE_API_URL=https://appi.droni.vip
```

`VITE_API_URL` must be defined at build time — `AppiService` throws on startup if it's missing.

## Architecture

**File-based routing** via `vite-plugin-pages`: every `.vue` file under `src/pages/` becomes a route automatically. The directory structure maps directly to URL paths (e.g. `src/pages/social/comments/index.vue` → `/social/comments`). Dynamic segments use brackets: `src/pages/content/posts/[id].vue` → `/content/posts/:id`.

**Auth flow**: `src/main.ts` registers a global `router.beforeEach` guard that redirects unauthenticated users to `/login`. Auth state lives in `src/composables/useAuth.ts` as module-level refs (not a Pinia store), so the state is shared across all component instances that call `useAuth()`. The token and `site_id` are persisted in `localStorage` under the keys `auth_token` and `site_id`.

**API client**: `src/services/AppiService.ts` is an Axios instance pointing at `VITE_API_URL`. A request interceptor automatically injects `Authorization: Bearer <token>` and `x-site-id` headers from `localStorage` on every request. Pass `x-site-id` explicitly in the login call before these values are stored.

**UI components**: The app uses `@dronico/droni-kit` (internal Droni design system). Import components from that package rather than building from scratch (`DuiCard`, `DuiInput`, `DuiButton`, `DuiAlert`, `DuiNavbar`, `DuiLabel`, etc.). Its CSS must be imported globally — it is already done in `src/main.ts`.

**Deployment**: The app builds to a static SPA served via Nginx. The `Dockerfile` is a two-stage build (Node builder → Nginx). `docker-compose.yml` expects an external `nginx-proxy` Docker network and sets `VIRTUAL_HOST`/`LETSENCRYPT_HOST` for the reverse proxy.

When asked to "redeploy" or "redesplegar", use Docker:

```bash
docker compose up -d --build
```
