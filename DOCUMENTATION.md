# Appi V2 — Documentación General

## ¿Qué es Appi?

**Appi** es una API backend multi-tenant que funciona como motor de contenido y comunidad para aplicaciones web o móviles. En lugar de ser una sola aplicación, está diseñada para servir a **múltiples sitios** desde una misma instalación: cada sitio tiene sus propios usuarios, posts, comentarios y archivos, completamente aislados entre sí.

Piénsalo como una plataforma headless similar a un CMS (Content Management System) con capa social: provee los datos y la lógica, mientras que el frontend (sitio web, app móvil, etc.) se construye por separado y consume esta API.

### ¿Para qué sirve funcionalmente?

- Permite a un sitio web tener un sistema de **registro y login** de usuarios (con email/password o Google).
- Permite publicar y consumir **posts** (artículos, noticias, etc.) con soporte para tags, imágenes y metadatos personalizados.
- Permite a los usuarios **subir archivos** (imágenes, documentos, etc.) almacenados en la nube (AWS S3 / DigitalOcean Spaces).
- Permite una sección de **comentarios** anidados en cualquier post, con moderación por parte de administradores.
- Los administradores del sitio pueden gestionar todo el contenido desde rutas protegidas.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | AdonisJS 7.3.1 (Node.js + TypeScript) |
| Base de datos | MySQL 8 |
| ORM | Lucid (AdonisJS) |
| Autenticación | Tokens de acceso API + OAuth2 (Google) |
| Almacenamiento | AWS S3 / DigitalOcean Spaces |
| Email | SMTP via @adonisjs/mail |
| Validación | VineJS |
| Lenguaje | TypeScript 6 |

---

## Concepto Clave: Multi-tenant (Multi-sitio)

Toda petición a la API **debe incluir** el header `x-site-id` con el UUID del sitio al que pertenece la request. Esto le dice a la API en qué contexto opera.

```
x-site-id: 4ebaccf5-b863-4f12-aa49-9bbe0e1844e2
```

Esto significa que:
- Un usuario puede existir en **múltiples sitios** con roles distintos.
- El contenido (posts, comentarios, archivos) está aislado por sitio.
- Las queries siempre filtran por el sitio del header, salvo `/auth/verify-email`.

La relación entre usuarios y sitios se maneja a través de la tabla `enrollments`, que actúa como tabla pivote y también almacena el **rol** del usuario en ese sitio.

---

## Modelos de Datos

### User (usuarios)

Representa a una persona registrada en el sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `full_name` | string \| null | Nombre completo |
| `email` | string | Email único en todo el sistema |
| `password` | string | Contraseña hasheada (bcrypt) |
| `avatar` | string \| null | URL de foto de perfil |
| `email_verified_at` | timestamp \| null | Fecha de verificación de email (null = no verificado) |

Un usuario **no puede hacer login** hasta que su email esté verificado.

---

### Site (sitios)

Representa una aplicación/sitio cliente que usa esta API.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único del sitio |
| `name` | string | Nombre del sitio |
| `url` | string | URL base del frontend (usada para redirecciones OAuth y email) |
| `description` | string \| null | Descripción breve |
| `logo` | string \| null | URL del logo |
| `expires_at` | timestamp \| null | Fecha de expiración del acceso al servicio |

---

### Enrollment (inscripciones)

Tabla pivote que relaciona usuarios con sitios y define el **rol** de cada usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `site_id` | UUID | Sitio al que pertenece |
| `user_id` | UUID | Usuario inscrito |
| `role` | string | Rol: `"owner"` o `"user"` |

**Roles:**
- `owner` → Administrador del sitio. Tiene acceso a todas las rutas `/admin/`.
- `user` → Usuario regular. Puede leer contenido público, comentar y subir archivos propios.

Un usuario se inscribe automáticamente al registrarse o loguearse por primera vez en un sitio.

---

### ContentPost (posts)

Artículos o entradas de contenido publicadas en un sitio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `site_id` | UUID | Sitio propietario |
| `user_id` | UUID | Usuario autor |
| `slug` | string | URL amigable, único por sitio (ej: `"mi-primer-post"`) |
| `name` | string | Título del post |
| `description` | text \| null | Resumen breve |
| `tags` | JSON \| null | Array de etiquetas (ej: `["tecnología", "noticias"]`) |
| `picture` | string \| null | URL de imagen destacada |
| `content` | text \| null | Cuerpo del post |
| `format` | string | Formato del contenido: `markdown`, `html` o `plaintext` |
| `active` | boolean | `true` = publicado, `false` = borrador |

Solo los posts con `active = true` son visibles en las rutas públicas.

---

### ContentPostAttribute (atributos personalizados de posts)

Metadatos adicionales clave-valor asociados a un post. Permite extender un post con campos personalizados sin modificar el esquema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `content_post_id` | UUID | Post al que pertenece |
| `name` | string | Nombre del atributo (ej: `"autor_invitado"`) |
| `type` | string | Tipo de dato (ej: `"string"`, `"integer"`, `"boolean"`) |
| `value` | string | Valor del atributo |

---

### ContentAttachment (archivos adjuntos)

Archivos subidos por usuarios y almacenados en la nube.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `site_id` | UUID | Sitio propietario |
| `user_id` | UUID | Usuario que subió el archivo |
| `name` | string | Nombre original del archivo |
| `path` | string | Ruta en S3 (`{siteId}/{userId}/{size}-{slug}`) |
| `size` | integer | Tamaño en bytes |
| `mime` | string | Tipo MIME (ej: `"image/png"`) |

**Restricciones:** Máximo 10 MB. Formatos permitidos: `jpg`, `png`, `pdf`, `doc`, `docx`, `xls`, `xlsx`, `zip`, `txt`, `md`.

---

### SocialComment (comentarios)

Comentarios de usuarios sobre posts, con soporte para respuestas anidadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `site_id` | UUID | Sitio donde existe |
| `user_id` | UUID | Usuario autor |
| `parent_id` | UUID \| null | Comentario padre (para respuestas anidadas) |
| `commentable_type` | string | Tipo de objeto comentado (ej: `"ContentPost"`) |
| `commentable_id` | UUID | ID del objeto comentado |
| `content` | text | Texto del comentario |
| `is_edited` | boolean | `true` si fue editado después de crearse |
| `active` | boolean | `false` = pendiente de moderación, `true` = visible |

Por defecto, los comentarios se crean con `active = false`. Un administrador debe aprobarlos para que sean visibles públicamente.

---

## Niveles de Acceso

La API tiene tres niveles de acceso:

| Nivel | Descripción | Cómo identificarse |
|-------|-------------|-------------------|
| **Público** | Sin autenticación | Solo el header `x-site-id` |
| **Usuario autenticado** | Login realizado, email verificado | Header `Authorization: Bearer <token>` |
| **Admin del sitio** | Usuario con rol `owner` en el sitio | Header `Authorization: Bearer <token>` |

---

## Flujo de Autenticación

### 1. Registro con email/password

```
POST /auth/register
Body: { email, password, passwordConfirmation, fullName }
```

1. Se valida el body (email único, password entre 8-32 chars, passwords coinciden).
2. Se crea el usuario con la contraseña hasheada.
3. Se crea un `Enrollment` con rol `"user"` para el sitio indicado en `x-site-id`.
4. Se devuelve `{ user, enrollment }`. **El email no está verificado aún — no se puede hacer login todavía.**

---

### 2. Verificación de email

```
POST /auth/send-verification-email
Body: { email }
```

1. Se genera una URL firmada con expiración de 24 horas:
   `GET /auth/verify-email/:enrollmentId?signature=...`
2. Se envía un email al usuario con ese link (template "emails/welcome").
3. Cuando el usuario hace click:
   - Se valida la firma (si expiró, se ignora silenciosamente).
   - Se marca `user.email_verified_at = ahora`.
   - Se redirige al frontend (`site.url`).

---

### 3. Login con email/password

```
POST /auth/login
Body: { email, password }
```

1. Se validan las credenciales.
2. Si el email **no está verificado** → error `400`.
3. Se crea o recupera el `Enrollment` del usuario en el sitio actual.
4. Se genera un token de acceso API.
5. Se devuelve `{ user, enrollment, token }`.

El token debe enviarse en todas las peticiones protegidas:
```
Authorization: Bearer <token>
```

---

### 4. Login con Google OAuth

```
GET /auth/google/url
```
1. El frontend llama a este endpoint para obtener la URL de redirección de Google.
2. La URL de callback se construye como `{site.url}/oauth/google/callback`.
3. El usuario es redirigido a Google para autorizar.

```
GET /auth/google/handle
```
4. Google redirige de vuelta con un código de autorización.
5. La API intercambia el código por los datos del usuario de Google.
6. Si el usuario no existe, se crea automáticamente con el email y avatar de Google.
7. El email se marca como verificado automáticamente.
8. Se crea o recupera el `Enrollment`.
9. Se genera un token de acceso API.
10. Se devuelve `{ user, enrollment, token }`.

---

### 5. Logout

```
POST /auth/logout
Authorization: Bearer <token>
```

Invalida el token actual. El usuario queda desautenticado.

---

### 6. Obtener usuario actual

```
GET /auth/me
Authorization: Bearer <token>  (opcional)
```

Devuelve los datos del usuario autenticado junto a su `Enrollment` en el sitio actual.

---

## Referencia de Endpoints

### Sitios

#### `GET /sites`
**Acceso:** Público

Lista todos los sitios registrados en el sistema con paginación.

**Query params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `page` | number | Número de página |
| `limit` | number | Resultados por página |

---

#### `GET /sites/:id`
**Acceso:** Público

Devuelve los detalles de un sitio específico por su UUID.

---

### Contenido — Posts

#### `GET /content/posts`
**Acceso:** Público

Lista los posts publicados (`active = true`) del sitio actual. Soporta búsqueda y filtros.

**Query params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `q` | string | Búsqueda por título o descripción (LIKE) |
| `tags` | string[] | Filtrar por tags (el post debe tener al menos uno de los tags) |
| `page` | number | Número de página |
| `per_page` | number | Resultados por página |

La respuesta incluye los atributos personalizados y los datos del autor de cada post.

---

#### `GET /content/posts/:slug`
**Acceso:** Público

Devuelve un post publicado buscado por su **slug** (no por ID). Incluye atributos y autor.

> El parámetro `:id` en la ruta corresponde al **slug** del post, no a su UUID.

---

### Contenido — Archivos (usuarios autenticados)

#### `GET /content/attachments`
**Acceso:** Usuario autenticado

Lista los archivos subidos por el usuario autenticado en el sitio actual.

**Query params:** `page`, `per_page`

---

#### `POST /content/attachments`
**Acceso:** Usuario autenticado

Sube un archivo al almacenamiento en la nube.

**Body (multipart/form-data):**
| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `name` | Sí | Nombre descriptivo del archivo |
| `file` | Sí | Archivo binario (máx 10 MB, formatos: jpg, png, pdf, doc, docx, xls, xlsx, zip, txt, md) |

El archivo se almacena en S3 bajo la ruta `{siteId}/{userId}/{tamaño}-{slug-nombre}.{ext}`.

---

#### `DELETE /content/attachments/:id`
**Acceso:** Usuario autenticado (solo el propietario)

Elimina un archivo propio. Verifica que el attachment pertenezca al usuario y sitio actuales antes de eliminarlo del disco y de la base de datos.

---

### Social — Comentarios

#### `GET /social/comments`
**Acceso:** Público

Lista los comentarios aprobados (`active = true`) y raíz (sin padre) de un objeto específico.

**Query params (requeridos):**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `commentable_type` | enum | Tipo de objeto: `"ContentPost"` |
| `commentable_id` | UUID | ID del objeto comentado |
| `page` | number | Número de página |
| `per_page` | number | Resultados por página |

Incluye los datos del autor de cada comentario. Ordenado por fecha de creación ascendente (más antiguo primero).

---

#### `GET /social/comments/:id`
**Acceso:** Público

Devuelve un comentario aprobado con su árbol completo:
- Datos del comentario
- Usuario autor
- Comentario padre (si existe) con su autor
- Comentarios hijos (respuestas) con sus autores, ordenados por fecha ascendente

---

#### `POST /social/comments`
**Acceso:** Usuario autenticado

Crea un comentario sobre un objeto (por ahora solo `ContentPost`). También permite crear **respuestas** a comentarios existentes via `parent_id`.

**Body (JSON):**
| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `commentable_type` | Sí | Tipo: `"ContentPost"` |
| `commentable_id` | Sí | UUID del post a comentar |
| `content` | Sí | Texto del comentario (mínimo 1 caracter) |
| `parent_id` | No | UUID del comentario padre (para replies) |

> El comentario se crea con `active = false`. No será visible hasta que un administrador lo apruebe.

---

#### `PATCH /social/comments/:id`
**Acceso:** Usuario autenticado (solo el autor, dentro de los primeros 5 minutos)

Edita el contenido de un comentario propio. Solo se puede editar dentro de los **5 minutos** posteriores a su creación. Si ese tiempo expiró, la API devuelve un error `403 Forbidden`.

Al editarse, el campo `is_edited` se marca como `true`.

**Body (JSON):**
| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `content` | Sí | Nuevo contenido del comentario |

---

### Admin — Posts

> Todas las rutas `/admin/` requieren autenticación con un usuario con rol `owner` en el sitio actual.

#### `GET /admin/content/posts`
**Acceso:** Admin

Lista todos los posts del sitio, incluyendo borradores (`active = false`). Paginado con `page` y `per_page`.

---

#### `POST /admin/content/posts`
**Acceso:** Admin

Crea un nuevo post en el sitio actual.

**Body (JSON):**
| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `name` | Sí | Título del post |
| `description` | No | Resumen breve |
| `tags` | No | Array de strings con etiquetas |
| `picture` | No | URL de imagen destacada |
| `content` | No | Cuerpo del post |
| `format` | No | `"markdown"` (default), `"html"` o `"plaintext"` |
| `active` | No | `true` para publicar, `false` para borrador |

El slug se genera automáticamente desde el título. Si ya existe un slug igual en el sitio, se le agrega un sufijo aleatorio de 6 caracteres.

---

#### `GET /admin/content/posts/:id`
**Acceso:** Admin

Devuelve un post del sitio actual por su UUID (a diferencia del endpoint público que usa el slug).

---

#### `PATCH /admin/content/posts/:id`
**Acceso:** Admin

Actualiza uno o varios campos de un post existente. Todos los campos son opcionales.

---

#### `DELETE /admin/content/posts/:id`
**Acceso:** Admin

Elimina un post permanentemente. Los atributos asociados se eliminan en cascada.

---

### Admin — Atributos de Posts

#### `GET /admin/content/posts/:post_id/attributes`
**Acceso:** Admin

Lista todos los atributos personalizados de un post.

---

#### `POST /admin/content/posts/:post_id/attributes`
**Acceso:** Admin

Agrega un atributo personalizado a un post.

**Body (JSON):**
| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `name` | Sí | Nombre del atributo |
| `value` | Sí | Valor del atributo |
| `type` | No | Tipo de dato (ej: `"string"`, `"integer"`, `"boolean"`) |

---

#### `DELETE /admin/content/posts/:post_id/attributes/:id`
**Acceso:** Admin

Elimina un atributo personalizado de un post.

---

### Admin — Archivos

#### `GET /admin/content/attachments`
**Acceso:** Admin

Lista **todos** los archivos del sitio, de todos los usuarios. A diferencia del endpoint público, no está restringido al usuario autenticado. Paginado.

---

#### `POST /admin/content/attachments`
**Acceso:** Admin

Sube un archivo en nombre propio (como administrador). Mismas reglas que el endpoint de usuario.

---

#### `DELETE /admin/content/attachments/:id`
**Acceso:** Admin

Elimina cualquier archivo del sitio sin restricción de propietario.

---

### Admin — Comentarios

#### `GET /admin/social/comments`
**Acceso:** Admin

Lista todos los comentarios del sitio, incluyendo los pendientes de moderación (`active = false`). Permite filtrar por objeto comentado.

**Query params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `commentable_type` | enum | Filtrar por tipo (ej: `"ContentPost"`) |
| `commentable_id` | UUID | Filtrar por objeto específico |
| `page` | number | Número de página |
| `per_page` | number | Resultados por página |

---

#### `GET /admin/social/comments/:id`
**Acceso:** Admin

Devuelve un comentario con su árbol completo (igual que el endpoint público pero sin filtrar por `active`).

---

#### `PATCH /admin/social/comments/:id`
**Acceso:** Admin

Aprueba o desaprueba un comentario cambiando su estado `active`.

**Body (JSON):**
| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `active` | Sí | `true` para aprobar, `false` para ocultar |

Este es el mecanismo de **moderación de comentarios**.

---

#### `DELETE /admin/social/comments/:id`
**Acceso:** Admin

Elimina un comentario permanentemente del sitio.

---

## Resumen de Permisos por Endpoint

| Endpoint | Público | Usuario | Admin |
|----------|:-------:|:-------:|:-----:|
| `GET /sites` | ✓ | ✓ | ✓ |
| `GET /sites/:id` | ✓ | ✓ | ✓ |
| `POST /auth/register` | ✓ | | |
| `POST /auth/login` | ✓ | | |
| `POST /auth/logout` | | ✓ | ✓ |
| `GET /auth/me` | | ✓ | ✓ |
| `GET /auth/google/url` | ✓ | | |
| `GET /auth/google/handle` | ✓ | | |
| `POST /auth/send-verification-email` | ✓ | | |
| `GET /auth/verify-email/:id` | ✓ | | |
| `GET /content/posts` | ✓ | ✓ | ✓ |
| `GET /content/posts/:slug` | ✓ | ✓ | ✓ |
| `GET /content/attachments` | | ✓ | ✓ |
| `POST /content/attachments` | | ✓ | ✓ |
| `DELETE /content/attachments/:id` | | ✓ (propio) | ✓ |
| `GET /social/comments` | ✓ | ✓ | ✓ |
| `GET /social/comments/:id` | ✓ | ✓ | ✓ |
| `POST /social/comments` | | ✓ | ✓ |
| `PATCH /social/comments/:id` | | ✓ (propio, <5min) | ✓ |
| `GET /admin/content/posts` | | | ✓ |
| `POST /admin/content/posts` | | | ✓ |
| `GET /admin/content/posts/:id` | | | ✓ |
| `PATCH /admin/content/posts/:id` | | | ✓ |
| `DELETE /admin/content/posts/:id` | | | ✓ |
| `GET /admin/content/posts/:id/attributes` | | | ✓ |
| `POST /admin/content/posts/:id/attributes` | | | ✓ |
| `DELETE /admin/content/posts/:id/attributes/:id` | | | ✓ |
| `GET /admin/content/attachments` | | | ✓ |
| `POST /admin/content/attachments` | | | ✓ |
| `DELETE /admin/content/attachments/:id` | | | ✓ |
| `GET /admin/social/comments` | | | ✓ |
| `GET /admin/social/comments/:id` | | | ✓ |
| `PATCH /admin/social/comments/:id` | | | ✓ |
| `DELETE /admin/social/comments/:id` | | | ✓ |

---

## Variables de Entorno Requeridas

```env
# Aplicación
APP_KEY=<clave-aleatoria-segura>
APP_URL=http://localhost:3333

# Base de datos (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_DATABASE=appi

# Almacenamiento (AWS S3 o DigitalOcean Spaces)
DRIVE_DISK=spaces
SPACES_KEY=<access-key>
SPACES_SECRET=<secret-key>
SPACES_REGION=nyc3
SPACES_BUCKET=<nombre-del-bucket>
SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com

# Google OAuth
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>

# Email (SMTP)
MAIL_DRIVER=smtp
MAIL_HOST=<smtp-host>
MAIL_PORT=587
MAIL_USERNAME=<usuario>
MAIL_PASSWORD=<contraseña>
```

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev          # Servidor con hot reload

# Producción
npm run build        # Compilar TypeScript
npm run start        # Iniciar servidor

# Base de datos
node ace migration:run       # Ejecutar migraciones
node ace db:seed             # Ejecutar seeders

# Calidad de código
npm run typecheck    # Verificar tipos
npm run lint         # Linter
npm run format       # Formatear código

# Tests
npm run test
```

---

## Diagrama de Relaciones

```
Site ──────────────────────────────────────────────────────┐
  │                                                         │
  ├── Enrollment (site_id, user_id, role)                   │
  │       └── User                                          │
  │                                                         │
  ├── ContentPost (site_id)                                 │
  │       ├── ContentPostAttribute (content_post_id)        │
  │       └── User (user_id)                                │
  │                                                         │
  ├── ContentAttachment (site_id)                           │
  │       └── User (user_id)                                │
  │                                                         │
  └── SocialComment (site_id)                               │
          ├── User (user_id)                                │
          ├── SocialComment (parent_id) → árbol anidado     │
          └── ContentPost (commentable_id)                  │
                  └────────────────────────────────────────┘
```
