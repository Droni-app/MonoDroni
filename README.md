# MonoDroni

Monorepo del ecosistema **Droni.co** — todos los proyectos en un solo lugar para trabajar más rápido sin perder deployments independientes.

## Proyectos

| Directorio | Proyecto | Stack | URL |
|---|---|---|---|
| `apps/appi` | API Backend | AdonisJS 6 + Node 24 | appi.droni.vip |
| `apps/drodmin` | Backoffice | Vue 3 + Vite | drodmin.droni.vip |
| `apps/site` | Sitio Droni.co | Nuxt 3 | droni.co |
| `packages/droni-kit` | UI Library | Vue 3 + Vite | npm: @dronico/droni-kit |

---

## Requisitos

- **Node.js** >= 20 (recomendado: 22, ver `.nvmrc`)
- **npm** >= 10
- **Docker** (para levantar appi con base de datos en desarrollo)

```bash
# Si usas nvm
nvm use
```

---

## Instalación

Desde la raíz del monorepo instala todas las dependencias de todos los proyectos de una vez:

```bash
npm install --ignore-scripts
```

> `--ignore-scripts` evita que los `postinstall` de Nuxt fallen al instalarse fuera de su directorio. Los pasos de preparación (como `nuxt prepare`) se ejecutan dentro de cada app.

---

## Desarrollo

### Levantar todo en paralelo (Turborepo)

```bash
npm run dev
```

Esto lanza el servidor de desarrollo de cada proyecto simultáneamente usando Turborepo.

### Levantar un proyecto individualmente

```bash
# API (AdonisJS) — requiere variables de entorno y MySQL
cd apps/appi && npm run dev

# Backoffice (Vue 3 SPA)
cd apps/drodmin && npm run dev

# Sitio principal (Nuxt 3)
cd apps/site && npm run dev

# UI Library con Storybook
cd packages/droni-kit && npm run storybook
```

### Variables de entorno

Cada aplicación tiene su propio `.env`. Copia el ejemplo y ajusta los valores:

```bash
cp apps/appi/.env.example apps/appi/.env
```

Para `appi` en local puedes levantar la base de datos con Docker:

```bash
cd apps/appi && docker compose up -d
```

---

## Build

### Build de todos los proyectos

```bash
npm run build
```

Turborepo resuelve el orden correcto: primero construye `droni-kit`, luego las apps que lo usan.

### Build individual

```bash
# API
cd apps/appi && npm run build

# Backoffice
cd apps/drodmin && npm run build

# Sitio
cd apps/site && npm run build

# UI Library
cd packages/droni-kit && npm run build
```

---

## Semantic Commits

Este repositorio usa [Conventional Commits](https://www.conventionalcommits.org/) con **scopes obligatorios**. El hook de `commitlint` rechaza commits que no sigan el formato.

### Formato

```
<tipo>(<scope>): <descripción breve>
```

### Scopes disponibles

| Scope | Proyecto |
|---|---|
| `appi` | API Backend (`apps/appi`) |
| `site` | Sitio Droni.co (`apps/site`) |
| `drodmin` | Backoffice (`apps/drodmin`) |
| `droni-kit` | UI Library (`packages/droni-kit`) |
| `ci` | GitHub Actions / pipelines |
| `deps` | Actualizaciones de dependencias |
| `infra` | Infraestructura general (Docker, nginx, etc.) |
| `release` | Commits de release automatizados |

### Tipos disponibles

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `style` | Formato, espacios (no afecta lógica) |
| `refactor` | Reestructuración sin cambio funcional |
| `perf` | Mejoras de rendimiento |
| `test` | Agregar o corregir tests |
| `build` | Build system o dependencias externas |
| `ci` | Configuración de CI/CD |
| `chore` | Mantenimiento general |
| `revert` | Revertir un commit anterior |

### Ejemplos

```bash
# Nueva feature en el backoffice
git commit -m "feat(drodmin): agregar tabla de vuelos con filtros"

# Fix en el API
git commit -m "fix(appi): corregir validación de permisos en rutas de admin"

# Nuevo componente en la librería
git commit -m "feat(droni-kit): agregar componente DroniMap"

# Breaking change en droni-kit (dispara major release)
git commit -m "feat(droni-kit)!: refactorizar API de DroniButton

BREAKING CHANGE: la prop 'color' ahora se llama 'variant'"

# Actualización de dependencias
git commit -m "chore(deps): actualizar nuxt a 3.17"

# Cambio en CI
git commit -m "ci(appi): agregar step de Docker build en workflow"
```

### Breaking changes

Para commits que rompen compatibilidad, añade `!` después del scope o incluye `BREAKING CHANGE:` en el cuerpo:

```bash
git commit -m "feat(droni-kit)!: cambiar API de tokens de color"
```

---

## CI/CD

Cada proyecto tiene su propio workflow de GitHub Actions que se dispara **solo cuando cambian sus archivos** (`paths` filter). Un push que solo modifica `apps/site/` no ejecutará el pipeline de `appi`.

### Workflows

| Workflow | Se dispara cuando cambia | Qué hace |
|---|---|---|
| `appi.yml` | `apps/appi/**` | Tests con MySQL → Deploy |
| `drodmin.yml` | `apps/drodmin/**` | Build Vite → Deploy |
| `site.yml` | `apps/site/**` o `packages/droni-kit/**` | Build droni-kit → Build Nuxt → Deploy |
| `droni-kit-release.yml` | `packages/droni-kit/**` | Build → semantic-release → publica a npm |
| `droni-kit-storybook.yml` | `packages/droni-kit/**` | Build Storybook → GitHub Pages |

### Deploys pendientes de configurar

Los workflows de `appi`, `drodmin` y `site` tienen el paso de deploy como placeholder. Los tres usan Docker + nginx-proxy. El patrón recomendado es SSH al servidor y `docker compose pull && up`:

```yaml
# Ejemplo con appleboy/ssh-action
- name: Deploy via SSH
  uses: appleboy/ssh-action@v1
  with:
    host: ${{ secrets.SSH_HOST }}
    username: ${{ secrets.SSH_USER }}
    key: ${{ secrets.SSH_KEY }}
    script: |
      cd /srv/appi
      docker compose pull
      docker compose up -d --remove-orphans
```

### Secrets necesarios en GitHub

| Secret | Usado por |
|---|---|
| `NPM_TOKEN` | `droni-kit-release.yml` — publica el paquete en npm |
| `SSH_HOST` | Workflows de deploy (cuando los configures) |
| `SSH_USER` | Workflows de deploy |
| `SSH_KEY` | Workflows de deploy |

---

## droni-kit — UI Library

La librería se publica automáticamente a npm cuando se hace push a `main` con commits de scope `droni-kit`. El proceso es completamente automático.

### Versioning automático

Las releases siguen [semantic-release](https://semantic-release.gitbook.io/). El tipo de commit determina qué versión se incrementa:

| Commit | Versión |
|---|---|
| `fix(droni-kit): ...` | Patch `1.0.0` → `1.0.1` |
| `feat(droni-kit): ...` | Minor `1.0.0` → `1.1.0` |
| `feat(droni-kit)!: ...` | Major `1.0.0` → `2.0.0` |

> Solo los commits con scope `droni-kit` disparan releases. Cambios en otros proyectos no generan nueva versión del paquete.

Los tags en git usan el prefijo `droni-kit/v` (ej: `droni-kit/v1.19.0`) para no colisionar con posibles releases de otras apps.

### Desarrollo local con droni-kit

Las apps `site` y `drodmin` dependen de `@dronico/droni-kit`. Gracias a npm workspaces, al instalar desde la raíz se usa automáticamente la versión local del paquete en lugar de la publicada en npm.

Para ver los componentes en Storybook mientras desarrollas:

```bash
cd packages/droni-kit && npm run storybook
# Disponible en http://localhost:6006
```

---

## Estructura del repositorio

```
MonoDroni/
├── apps/
│   ├── appi/              # AdonisJS API — appi.droni.vip
│   │   ├── app/           # Controllers, models, services
│   │   ├── database/      # Migrations y seeders
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   ├── drodmin/           # Vue 3 Backoffice — drodmin.droni.vip
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   └── site/              # Nuxt 3 — droni.co
│       ├── pages/
│       ├── components/
│       └── nuxt.config.ts
├── packages/
│   └── droni-kit/         # UI Library — @dronico/droni-kit
│       ├── src/
│       ├── .storybook/
│       └── release.config.ts
├── .github/
│   └── workflows/         # CI/CD por proyecto
├── .husky/                # Git hooks
├── turbo.json             # Configuración Turborepo
├── package.json           # npm workspaces + scripts raíz
└── commitlint.config.js   # Reglas de conventional commits
```

---

## Comandos de referencia rápida

```bash
# Instalar todo
npm install --ignore-scripts

# Dev de todo
npm run dev

# Build de todo (en orden correcto)
npm run build

# Solo un proyecto
npm run dev --workspace=apps/site
npm run build --workspace=packages/droni-kit

# Actualizar subtrees desde los repos originales
git subtree pull --prefix=apps/appi appi main --squash
git subtree pull --prefix=apps/drodmin drodmin main --squash
git subtree pull --prefix=apps/site site master --squash
git subtree pull --prefix=packages/droni-kit droni-kit main --squash
```
