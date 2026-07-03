# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

MonoDroni is a Turborepo/npm-workspaces monorepo combining what used to be three independent repos (each still pushes to its own GitHub remote — see `git remote -v`: `appi`, `drodmin`, `site`). Treat each app under `apps/*` as an independently deployed project that happens to share tooling, not a single deployable unit.

| Path | Project | Stack | Deploy target |
|---|---|---|---|
| `apps/appi` | Backend API | AdonisJS 7 + TypeScript, MySQL | appi.droni.vip |
| `apps/drodmin` | Backoffice SPA | Vue 3 + Vite | drodmin.droni.vip |
| `apps/site` | Public site | Nuxt 3 | droni.co |

`packages/droni-kit` is an empty leftover directory — the shared UI kit was extracted into its own repo ([Droni-app/droni-kit](https://github.com/Droni-app/droni-kit)) and is consumed by `drodmin` and `site` as the published npm package `@dronico/droni-kit`, not as an in-repo workspace package.

Each app (`apps/appi`, `apps/drodmin`) has its own `CLAUDE.md` with app-specific commands and architecture — read that file when working inside it. `apps/site` does not have one yet.

## Commands (run from repo root)

```bash
npm install --ignore-scripts   # --ignore-scripts avoids nuxt postinstall failing outside its own dir
npm run dev                    # turbo run dev — all apps in parallel
npm run build                  # turbo run build — respects ^build dependency graph
npm run lint                   # turbo run lint
npm run test                   # turbo run test

# Target a single app instead of everything
npm run dev --workspace=apps/site
npm run build --workspace=apps/appi
```

Per-app commands (lint/test/typecheck granularity, single-test invocation, env setup) live in each app's own `CLAUDE.md`/`README.md` — see `apps/appi/CLAUDE.md` and `apps/drodmin/CLAUDE.md`.

Commit hooks are enforced by Husky + commitlint: `commit-msg` rejects anything not matching Conventional Commits with a **mandatory scope** — see "Commit convention" below.

## Cross-app architecture

### Multi-tenant API is the hub

`apps/appi` is a multi-tenant backend: every request carries an `x-site-id` header, and both `drodmin` and `site` are just two different clients of the same API operating against different (or the same) tenant sites. When changing appi's request/response shape, check both frontend consumers.

### The two frontends talk to appi differently

- **drodmin** (`apps/drodmin/src/services/AppiService.ts`) calls appi directly from the browser via Axios. An interceptor attaches `Authorization: Bearer <token>` and `x-site-id` from `localStorage` (`auth_token`, `site_id`) to every request. Auth state lives in `useAuth.ts` as module-level refs, not Pinia.
- **site** (`apps/site/server/api/appi/[...].{get,post,put}.ts`) never calls appi from the browser. It proxies through Nuxt server routes: the appi token is stored server-side in an **httpOnly cookie** (`appi_session_token`, set/read via `server/utils/appi_session.ts`), and `x-site-id` comes from `runtimeConfig.appiSiteId` (one fixed site per site deployment, unlike drodmin which is site-agnostic). Session-specific concerns (login, Google OAuth callback, logout) live under `server/api/session/*`.

Do not port patterns between them assuming shared auth plumbing — they are deliberately different (drodmin is a multi-site admin tool; site is single-tenant per deployment).

### Domain modules mirror across appi ↔ drodmin

appi organizes controllers/models by domain module (`content`, `social`, `store`, and each has an `admin/<module>` counterpart for owner-only CRUD vs. a public/user-scoped counterpart). drodmin's `src/pages/<module>/...` file-based routes map directly to these admin endpoints (e.g. `store/products`, `store/orders`, `store/coupons`, `store/shipping-rules`, `social/comments`, `social/topics`). When adding a new domain module, expect to touch: appi model(s) + admin controller + public/user controller + route group in `start/routes.ts`, and a matching drodmin page tree.

### Plans precede implementation

`plans/*.md` (e.g. `StoreModule.md`, `LearnModule.md`) are the spec-first design docs for a domain module — data model (tables/columns), controller list, and drodmin page list — written before the module is built. Both are now implemented in appi + drodmin (`store`, `learn`). When implementing a plan, follow its module structure exactly (model fields, controller action sets, page list) rather than inventing new shapes — but treat ambiguous points (computed-field direction, role semantics, retry/attempt limits) as open questions to confirm, not to guess silently.

### Learn module: slug-addressed public API + course-level roles

The `learn` module (courses/lessons/questions/answers/quizzes/enrollments — `app/{controllers,models}/learn/` and `admin/learn/`, migrations in `database/migrations/learn/`) has two things that don't match the `store`/`social` pattern:

- **Course-level roles are separate from site-level roles.** `learn_enrollments.role` (`student`/`teacher`/`admin`, scoped to one course) is unrelated to the site-level `Enrollment.role` (`owner`/`user`) used by `adminSite`/`enrolledUser`. A new `courseRole` middleware (`app/middleware/course_role_middleware.ts`) gates the public `/learn/*` routes on it.
- **Public routes address courses and lessons by slug, not id** (drodmin's `/admin/learn/*` still uses real ids everywhere). Since `learn_enrollments` and every nested table key off the real course id, `courseRole` middleware resolves the slug once per request and **rewrites `ctx.params.course_id` to the real id in place** — every downstream controller gated by that middleware can keep matching on `params.course_id` directly, unchanged. Routes *not* behind `courseRole` (public `lessons.index/show`, self-enroll `enrollments.store`) resolve the slug themselves. `lesson_id` on 3-level nested routes (`courses.lessons.answers`, `courses.lessons.quizzes`) is *not* touched by the middleware, so `answers_controller.ts`/`quizzes_controller.ts` each resolve it via a local `resolveLesson()` helper.
- **Activity/quiz records key off the enrollment, not the user.** `learn_lesson_views`, `learn_lesson_answers`, and `learn_lesson_questions_quizzes` all carry `learn_enrollment_id` (not `user_id`) — a row can only exist for someone actually enrolled in that course. `learn_progress_service.ts` recomputes `enrollment.progress` from the enrollment's own view count.
- **Quiz submission is atomic and stateless.** A student POSTs answers for *every* linked question in one request (`quizzes_controller.store`); there's no "start quiz, then answer" flow. Grading, `wons`/`losses`/`difficulty` updates, and progress recompute all happen inside that single request. Multiple attempts are allowed (no unique constraint on `learn_lesson_questions_quizzes`).

### Gotchas discovered while building this

- **Lucid mis-pluralizes irregular model names.** Table name is auto-derived from the model class name (`SnakeCaseNamingStrategy.tableName`); "Quiz" → "Quizs" instead of "Quizzes". If a model's English plural is irregular, set `static table = '...'` explicitly rather than trusting the convention — the bug only surfaces on whichever query path actually hits that model (in this case, only when a request came from an *enrolled* user, which made it look intermittent).
- **`.whereLike()` breaks on this project's `utf8mb4` tables.** Knex's MySQL `whereLike()` hardcodes `COLLATE utf8_bin`, which MySQL rejects on `utf8mb4` columns (`COLLATION 'utf8_bin' is not valid for CHARACTER SET 'utf8mb4'`). Use `.whereILike()` instead (case-insensitive, no forced collation) — plain `.where(col, 'like', val)` also works. `content/posts` and `store/products`' public search likely have this same latent bug (not fixed, since out of scope when found).
- **site's generic `/api/appi/[...].{method}.ts` proxy doesn't catch errors.** A failed appi call surfaces to the browser with the error body wrapped one level deeper (`e.data.data.message`) than a dedicated endpoint like `server/api/session/login.post.ts` that explicitly catches and rethrows via `createError` (`e.data.message`). Don't add new dedicated proxy endpoints for one-off actions, though — reuse the generic `/api/appi` proxy and read the nested error shape client-side (this was corrected once already in this module).
- **Nuxt pages reuse the component instance across sibling dynamic routes.** Navigating `/cursos/[slug]/[lessonSlug]` → a different lesson in the same course does *not* re-run `<script setup>` (Vue Router keeps the instance, only updates `route.params`). Any `useFetch`/`useAsyncData` whose URL or key is a plain string computed once at setup will go stale on that kind of client-side navigation. Always pass a reactive getter (`() => \`...${route.params.x}...\``) for both the URL and the `key`.

## Commit convention

Conventional Commits with **required scope**: `<type>(<scope>): <description>`.

Scopes: `appi`, `drodmin`, `site`, `ci`, `deps`, `repo` (root monorepo config), `infra` (Docker/nginx), `release`.
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

```bash
git commit -m "feat(appi): add learn module enrollments endpoint"
git commit -m "fix(drodmin): correct coupon discount validation"
```

## CI/CD

Each app has its own GitHub Actions workflow gated by a `paths` filter (`apps/appi/**`, `apps/drodmin/**`, `apps/site/**`) — a change to one app does not trigger the others' pipelines. Deploys target Docker + nginx-proxy per app (see each app's `Dockerfile`/`docker-compose.yml`).
