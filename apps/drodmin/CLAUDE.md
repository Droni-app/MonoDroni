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
VITE_API_URL=https://appi.droni.co
VITE_APP_URL=https://drodmin.droni.co
VITE_APPI_OAUTH_CLIENT_ID=<client id from appi's oauth:spa-client>
```

`VITE_API_URL` must be defined at build time — `AppiService` throws on startup if it's missing.

## Architecture

**File-based routing** via `vite-plugin-pages`: every `.vue` file under `src/pages/` becomes a route automatically. The directory structure maps directly to URL paths (e.g. `src/pages/social/comments/index.vue` → `/social/comments`). Dynamic segments use brackets: `src/pages/content/posts/[id].vue` → `/content/posts/:id`.

**Auth flow**: login is OAuth 2.1 with PKCE against appi, as a public first-party client: drodmin ships no secret and never sees a password, and login, signup and recovery are appi's pages (`VITE_APPI_OAUTH_CLIENT_ID`, created with `node ace oauth:spa-client <name> <redirect-uri>` in appi; the redirect URI is `<VITE_APP_URL>/oauth/callback`). `/oauth/callback` exchanges the code for an `oat_` token, then `/sites` lists the sites from `GET /auth/sites` where the user is `owner`, the only role appi's admin routes accept, skipping the choice if there's only one. After that the header's `SiteSelector` switches site at any time: it goes to `/` and `App.vue` rebuilds the page (`RouterView` keyed by site), since pages load their data on mount and ids belong to one site. A session change in another tab reloads this one (`useAuth.ts`), because requests read the site from `localStorage` on every call. `src/main.ts`'s `router.beforeEach` sends users without a token to `/login` and without a site to `/sites`. Auth state lives in `src/composables/useAuth.ts` as module-level refs (not a Pinia store), so the state is shared across all component instances that call `useAuth()`. The token and `site_id` are persisted in `localStorage` under the keys `auth_token` and `site_id`, and a 401 from appi ends the session (`AppiService.ts`).

**API client**: `src/services/AppiService.ts` is an Axios instance pointing at `VITE_API_URL`. A request interceptor automatically injects `Authorization: Bearer <token>` and `x-site-id` headers from `localStorage` on every request.

**UI components**: The app uses `@dronico/droni-kit` (internal Droni design system). Import components from that package rather than building from scratch (`DuiCard`, `DuiInput`, `DuiButton`, `DuiAlert`, `DuiNavbar`, `DuiLabel`, etc.). Its CSS must be imported globally — it is already done in `src/main.ts`.

**Page conventions** (follow these when adding a resource):

- List pages use `usePaginatedList(url, () => filters)` and bind `tablePagination` to `DuiTable`, with `EmptyState` below it.
- Create/edit share one self-saving form component per resource (`components/<module>/XForm.vue`) taking an optional `item` prop: no item → POST and redirect to the edit page; item → PATCH. `create.vue`/`[id].vue` stay thin (`PageHeader` + `useFetchItem` + form).
- Forms use `DuiForm` + `DuiCard` + `DuiLabel title=...`; booleans use `DuiSwitch`, enums `DuiSelect`. Optional text fields are kept as `''` and converted with `emptyToNull()` before sending.
- Feedback goes through `useToast()` (the `DuiToast` host is in `App.vue`); error messages via `apiError(e, fallback)`. Deletes use `ConfirmDelete`.
- Statuses/roles render with `StatusBadge` (labels/colors in `utils/labels.ts`). MySQL returns booleans as `1/0`: coerce with `!!` before binding to a switch.
- `DuiNavbar` and `DuiTabs` render `icon` as plain text, so don't pass mdi classes to them. Modules/sections live in `src/navigation.ts`.

**Deployment**: The app builds to a static SPA served via Nginx. The `Dockerfile` is a two-stage build (Node builder → Nginx). `docker-compose.yml` expects an external `nginx-proxy` Docker network and sets `VIRTUAL_HOST`/`LETSENCRYPT_HOST` for the reverse proxy.

When asked to "redeploy" or "redesplegar", use Docker:

```bash
docker compose up -d --build
```
