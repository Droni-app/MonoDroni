# MonoDroni

Monorepo del ecosistema **Droni.co** — todos los proyectos en un solo lugar para trabajar más rápido sin perder deployments independientes.

## Proyectos

| Directorio | Proyecto | Stack | URL |
|---|---|---|---|
| `apps/appi` | API Backend | AdonisJS 6 + Node 24 | appi.droni.vip |
| `apps/drodmin` | Backoffice | Vue 3 + Vite | drodmin.droni.vip |
| `apps/site` | Sitio Droni.co | Nuxt 3 | droni.co |

> La librería de componentes **droni-kit** (`@dronico/droni-kit`) se mantiene en su propio repositorio: [Droni-app/droni-kit](https://github.com/Droni-app/droni-kit)

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

### Build individual

```bash
# API
cd apps/appi && npm run build

# Backoffice
cd apps/drodmin && npm run build

# Sitio
cd apps/site && npm run build
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
| `ci` | GitHub Actions / pipelines |
| `deps` | Actualizaciones de dependencias |
| `repo` | Configuración raíz del monorepo (turbo.json, .nvmrc, README, husky...) |
| `infra` | Infraestructura de servidores (Docker, nginx, docker-compose) |
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

# Actualización de dependencias
git commit -m "chore(deps): actualizar nuxt a 3.17"

# Cambio en CI
git commit -m "ci(appi): agregar step de Docker build en workflow"

# Cambio en configuración raíz del monorepo
git commit -m "chore(repo): actualizar .nvmrc a Node 24"

# Cambio de infraestructura
git commit -m "chore(infra): actualizar nginx.conf en drodmin"
```

---

## CI/CD

Cada proyecto tiene su propio workflow de GitHub Actions que se dispara **solo cuando cambian sus archivos** (`paths` filter). Un push que solo modifica `apps/site/` no ejecutará el pipeline de `appi`.

### Workflows

| Workflow | Se dispara cuando cambia | Qué hace |
|---|---|---|
| `appi.yml` | `apps/appi/**` | Tests con MySQL → Deploy |
| `drodmin.yml` | `apps/drodmin/**` | Build Vite → Deploy |
| `site.yml` | `apps/site/**` | Build Nuxt → Deploy |

### Deploys pendientes de configurar

Los tres proyectos usan Docker + nginx-proxy. El patrón recomendado es SSH al servidor:

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
| `SSH_HOST` | Workflows de deploy (cuando los configures) |
| `SSH_USER` | Workflows de deploy |
| `SSH_KEY` | Workflows de deploy |

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

# Build de todo
npm run build

# Solo un proyecto
npm run dev --workspace=apps/site
npm run build --workspace=apps/appi

# Actualizar subtrees desde los repos originales
git subtree pull --prefix=apps/appi appi main --squash
git subtree pull --prefix=apps/drodmin drodmin main --squash
git subtree pull --prefix=apps/site site master --squash
```
