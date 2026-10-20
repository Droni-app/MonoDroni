/**
 * Documentación pública de appi para desarrolladores que construyen su propio
 * frontend sobre un siteId. Solo describe el contrato HTTP: no incluir aquí
 * detalles de infraestructura, rutas internas ni herramientas de operación.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type Access =
  | 'public'
  | 'optional'
  | 'auth'
  | 'member'
  | 'owner'
  | 'student'
  | 'student-staff'
  | 'staff'
  | 'course-admin'

export interface ApiField {
  name: string
  type: string
  required?: boolean
  description: string
}

export interface ApiEndpoint {
  id: string
  method: HttpMethod
  path: string
  summary: string
  description?: string
  access: Access
  pathParams?: ApiField[]
  query?: ApiField[]
  body?: ApiField[]
  multipart?: boolean
  request?: string
  response?: string
  notes?: string[]
}

export interface ApiGroup {
  id: string
  title: string
  description?: string
  admin?: boolean
  endpoints: ApiEndpoint[]
}

export interface ApiModule {
  slug: string
  name: string
  icon: string
  summary: string
  intro: string[]
  groups: ApiGroup[]
}

export const APPI_BASE_URL = 'https://appi.droni.co'

export const accessLabels: Record<Access, { label: string, description: string, tone: string }> = {
  public: { label: 'Público', description: 'Solo requiere el header x-site-id.', tone: 'emerald' },
  optional: { label: 'Sesión opcional', description: 'Público, pero si envías un token la respuesta incluye datos del usuario.', tone: 'sky' },
  auth: { label: 'Autenticado', description: 'Requiere Authorization: Bearer <token>.', tone: 'amber' },
  member: { label: 'Miembro del sitio', description: 'Requiere token y que el usuario esté inscrito en el sitio.', tone: 'amber' },
  owner: { label: 'Owner del sitio', description: 'Requiere token de un usuario con rol owner en el sitio.', tone: 'rose' },
  student: { label: 'Estudiante del curso', description: 'Requiere rol student en el curso.', tone: 'violet' },
  'student-staff': { label: 'Inscrito en el curso', description: 'Requiere rol student, teacher o admin en el curso.', tone: 'violet' },
  staff: { label: 'Teacher / Admin del curso', description: 'Requiere rol teacher o admin en el curso.', tone: 'violet' },
  'course-admin': { label: 'Admin del curso', description: 'Requiere rol admin en el curso.', tone: 'violet' },
}

const pagination: ApiField[] = [
  { name: 'page', type: 'number', description: 'Página a consultar (por defecto 1).' },
  { name: 'per_page', type: 'number', description: 'Resultados por página (por defecto 10).' },
]

const idParam = (description: string): ApiField => ({ name: 'id', type: 'string', required: true, description })
const courseSlug: ApiField = { name: 'course', type: 'string', required: true, description: 'Slug del curso.' }
const lessonSlug: ApiField = { name: 'lesson', type: 'string', required: true, description: 'Slug de la lección.' }

const paginatedExample = (item: string) => `{
  "meta": {
    "total": 15,
    "perPage": 10,
    "currentPage": 1,
    "lastPage": 2,
    "firstPage": 1
  },
  "data": [
    ${item.split('\n').join('\n    ')}
  ]
}`

const extendExample = (json: string, extra: string) => json.replace(/\n}$/, `,\n  ${extra}\n}`)

const userSummary = `"user": { "id": "uuid", "fullName": "Ada Lovelace", "avatar": "https://…" }`

/* -------------------------------------------------------------------------- */
/*                                    AUTH                                    */
/* -------------------------------------------------------------------------- */

const authModule: ApiModule = {
  slug: 'auth',
  name: 'Autenticación',
  icon: 'mdi mdi-shield-account-outline',
  summary: 'Registro, inicio de sesión con email o Google, verificación de correo y sesión actual.',
  intro: [
    'Los usuarios de appi son globales: un mismo email puede participar en varios sitios. Cada vez que un usuario se registra o inicia sesión en tu sitio, appi crea (si no existe) su inscripción al sitio con rol user.',
    'El login devuelve un token opaco tipo Bearer. Guárdalo del lado del servidor (por ejemplo en una cookie httpOnly) y envíalo en el header Authorization de cada petición que lo requiera.',
  ],
  groups: [
    {
      id: 'email',
      title: 'Email y contraseña',
      endpoints: [
        {
          id: 'register',
          method: 'POST',
          path: '/auth/register',
          summary: 'Registrar un usuario',
          description: 'Crea la cuenta, la inscribe en tu sitio y envía un correo de bienvenida con un enlace de verificación válido por 24 horas. Al abrir el enlace, el usuario queda verificado y es redirigido a la URL configurada para tu sitio.',
          access: 'public',
          body: [
            { name: 'fullName', type: 'string | null', required: true, description: 'Nombre completo.' },
            { name: 'email', type: 'string', required: true, description: 'Email válido, máximo 254 caracteres. Debe ser único.' },
            { name: 'password', type: 'string', required: true, description: 'Entre 8 y 32 caracteres.' },
            { name: 'passwordConfirmation', type: 'string', required: true, description: 'Debe coincidir con password.' },
          ],
          request: `{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "unaClaveSegura",
  "passwordConfirmation": "unaClaveSegura"
}`,
          response: `{
  "user": { "id": "uuid", "fullName": "Ada Lovelace", "email": "ada@example.com", "avatar": null },
  "enrollment": { "id": "uuid", "siteId": "uuid", "userId": "uuid", "role": "user" }
}`,
          notes: ['El usuario no puede iniciar sesión hasta verificar su correo.'],
        },
        {
          id: 'resend-verification',
          method: 'POST',
          path: '/auth/send-verification-email',
          summary: 'Reenviar correo de verificación',
          access: 'public',
          body: [{ name: 'email', type: 'string', required: true, description: 'Email del usuario.' }],
          request: `{ "email": "ada@example.com" }`,
          response: `{ "message": "Verification email sent. Please check your inbox." }`,
        },
        {
          id: 'login',
          method: 'POST',
          path: '/auth/login',
          summary: 'Iniciar sesión',
          access: 'public',
          body: [
            { name: 'email', type: 'string', required: true, description: 'Email del usuario.' },
            { name: 'password', type: 'string', required: true, description: 'Contraseña.' },
          ],
          request: `{ "email": "ada@example.com", "password": "unaClaveSegura" }`,
          response: `{
  "user": { "id": "uuid", "fullName": "Ada Lovelace", "email": "ada@example.com", "avatar": null },
  "enrollment": { "id": "uuid", "role": "user" },
  "token": "oat_…"
}`,
          notes: [
            'Responde 400 con { "message": "Email not verified." } si el correo aún no fue verificado.',
            'Unas credenciales inválidas responden con un error genérico, sin indicar si falló el email o la contraseña.',
          ],
        },
        {
          id: 'me',
          method: 'GET',
          path: '/auth/me',
          summary: 'Usuario de la sesión actual',
          description: 'Útil para hidratar el estado de sesión del frontend y conocer el rol del usuario en el sitio (user u owner).',
          access: 'auth',
          response: `{
  "user": { "id": "uuid", "fullName": "Ada Lovelace", "email": "ada@example.com", "avatar": null, "emailVerifiedAt": "2026-01-01T00:00:00.000Z" },
  "enrollment": { "id": "uuid", "role": "user" }
}`,
        },
        {
          id: 'logout',
          method: 'POST',
          path: '/auth/logout',
          summary: 'Cerrar sesión',
          description: 'Revoca el token usado en la petición.',
          access: 'auth',
          response: `{ "message": "Logged out successfully" }`,
        },
      ],
    },
    {
      id: 'google',
      title: 'Google OAuth',
      description: 'Flujo en dos pasos: pides la URL de autorización, rediriges al usuario y, cuando Google lo devuelve a tu callback con un code, lo intercambias por un token de appi. La URL de callback debe estar autorizada para el cliente OAuth de appi: solicítala junto con tu siteId.',
      endpoints: [
        {
          id: 'google-url',
          method: 'GET',
          path: '/auth/google/url',
          summary: 'Obtener la URL de autorización de Google',
          access: 'public',
          query: [{ name: 'callbackUrl', type: 'string', required: true, description: 'URL de tu frontend a la que Google devolverá al usuario.' }],
          response: `{ "url": "https://accounts.google.com/o/oauth2/v2/auth?…" }`,
        },
        {
          id: 'google-handle',
          method: 'GET',
          path: '/auth/google/handle',
          summary: 'Intercambiar el code de Google por un token',
          description: 'Si el email no existe, se crea la cuenta (ya verificada). En ambos casos se inscribe al usuario en tu sitio.',
          access: 'public',
          query: [
            { name: 'code', type: 'string', required: true, description: 'Código que Google agregó a tu callback.' },
            { name: 'callbackUrl', type: 'string', required: true, description: 'La misma URL usada en el paso anterior.' },
          ],
          response: `{
  "user": { "id": "uuid", "fullName": "Ada Lovelace", "email": "ada@example.com", "avatar": "https://…" },
  "enrollment": { "id": "uuid", "role": "user" },
  "token": "oat_…"
}`,
        },
      ],
    },
    {
      id: 'site',
      title: 'Información del sitio',
      endpoints: [
        {
          id: 'site-show',
          method: 'GET',
          path: '/sites/:id',
          summary: 'Datos públicos de un sitio',
          description: 'Nombre, URL, descripción y logo del sitio, útiles para la marca de tu frontend.',
          access: 'public',
          pathParams: [idParam('Tu siteId.')],
          response: `{ "id": "uuid", "name": "Mi sitio", "url": "https://misitio.com", "description": "…", "logo": "https://…" }`,
        },
      ],
    },
  ],
}

/* -------------------------------------------------------------------------- */
/*                                   CONTENT                                  */
/* -------------------------------------------------------------------------- */

const postExample = `{
  "id": "uuid",
  "slug": "mi-primer-post",
  "name": "Mi primer post",
  "description": "Resumen corto",
  "tags": ["noticias"],
  "picture": "https://…",
  "content": "# Hola mundo",
  "format": "markdown",
  "active": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  ${userSummary},
  "attributes": [{ "id": "uuid", "name": "autor_invitado", "type": "string", "value": "Grace" }]
}`

const attachmentExample = `{
  "id": "uuid",
  "name": "portada.png",
  "size": 204800,
  "mime": "image/png",
  "url": "https://…/portada.png",
  "createdAt": "2026-01-01T00:00:00.000Z"
}`

const postBody: ApiField[] = [
  { name: 'name', type: 'string', required: true, description: 'Título. El slug se genera a partir de él.' },
  { name: 'description', type: 'string | null', required: true, description: 'Resumen.' },
  { name: 'tags', type: 'string[] | null', required: true, description: 'Etiquetas.' },
  { name: 'picture', type: 'string | null', description: 'URL de la imagen principal.' },
  { name: 'content', type: 'string | null', description: 'Cuerpo del post.' },
  { name: 'format', type: "'markdown' | 'html' | 'plaintext'", description: 'Formato del contenido.' },
  { name: 'active', type: 'boolean', description: 'Publicado (true) o borrador (false).' },
]

const contentModule: ApiModule = {
  slug: 'content',
  name: 'Content',
  icon: 'mdi mdi-newspaper-variant-multiple-outline',
  summary: 'Posts para blogs, noticias o páginas, con etiquetas, atributos personalizados y archivos adjuntos.',
  intro: [
    'Un post tiene título, slug, resumen, contenido (markdown, html o texto plano), etiquetas e imagen. Además admite atributos clave-valor libres para modelar campos propios de tu sitio (autor invitado, SEO, orden, etc.).',
    'Los endpoints públicos solo devuelven posts activos y los buscan por slug, ideales para rutas como /blog/:slug.',
  ],
  groups: [
    {
      id: 'posts',
      title: 'Posts',
      endpoints: [
        {
          id: 'posts-index',
          method: 'GET',
          path: '/content/posts',
          summary: 'Listar posts publicados',
          description: 'Ordenados del más reciente al más antiguo.',
          access: 'public',
          query: [
            ...pagination,
            { name: 'q', type: 'string', description: 'Búsqueda por título o descripción.' },
            { name: 'tags', type: 'string | string[]', description: 'Filtra posts que tengan todas las etiquetas indicadas (repite el parámetro: ?tags=a&tags=b).' },
          ],
          response: paginatedExample(postExample),
        },
        {
          id: 'posts-show',
          method: 'GET',
          path: '/content/posts/:slug',
          summary: 'Obtener un post por slug',
          access: 'public',
          pathParams: [{ name: 'slug', type: 'string', required: true, description: 'Slug del post.' }],
          response: postExample,
        },
      ],
    },
    {
      id: 'attachments',
      title: 'Archivos adjuntos del usuario',
      description: 'Cada usuario puede subir y gestionar sus propios archivos dentro del sitio (avatares, adjuntos de actividades, etc.).',
      endpoints: [
        {
          id: 'attachments-index',
          method: 'GET',
          path: '/content/attachments',
          summary: 'Listar mis archivos',
          access: 'auth',
          query: pagination,
          response: paginatedExample(attachmentExample),
        },
        {
          id: 'attachments-store',
          method: 'POST',
          path: '/content/attachments',
          summary: 'Subir un archivo',
          access: 'auth',
          multipart: true,
          body: [
            { name: 'name', type: 'string', required: true, description: 'Nombre visible del archivo.' },
            { name: 'file', type: 'file', required: true, description: 'Máximo 10 MB. Extensiones: jpg, png, pdf, doc, docx, xls, xlsx, zip, text, markdown.' },
          ],
          request: `curl -X POST ${APPI_BASE_URL}/content/attachments \\
  -H "x-site-id: $APPI_SITE_ID" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "name=portada.png" \\
  -F "file=@./portada.png"`,
          response: attachmentExample,
          notes: ['Usa la propiedad url de la respuesta para mostrar o enlazar el archivo.'],
        },
        {
          id: 'attachments-destroy',
          method: 'DELETE',
          path: '/content/attachments/:id',
          summary: 'Eliminar un archivo propio',
          access: 'auth',
          pathParams: [idParam('ID del archivo.')],
          response: attachmentExample,
        },
      ],
    },
    {
      id: 'admin-content',
      title: 'Administración de contenido',
      admin: true,
      description: 'Gestión completa de posts y archivos del sitio. Aquí los posts se identifican por id, no por slug, y se incluyen borradores.',
      endpoints: [
        {
          id: 'admin-posts-index',
          method: 'GET',
          path: '/admin/content/posts',
          summary: 'Listar todos los posts (incluye borradores)',
          access: 'owner',
          query: [...pagination, { name: 'q', type: 'string', description: 'Búsqueda por título.' }],
          response: paginatedExample(postExample),
        },
        {
          id: 'admin-posts-store',
          method: 'POST',
          path: '/admin/content/posts',
          summary: 'Crear un post',
          access: 'owner',
          body: postBody,
          request: `{
  "name": "Lanzamiento",
  "description": "Ya está disponible",
  "tags": ["noticias"],
  "content": "# ¡Hola!",
  "format": "markdown",
  "active": false
}`,
          response: postExample,
        },
        { id: 'admin-posts-show', method: 'GET', path: '/admin/content/posts/:id', summary: 'Obtener un post por id', access: 'owner', pathParams: [idParam('ID del post.')], response: postExample },
        {
          id: 'admin-posts-update',
          method: 'PUT',
          path: '/admin/content/posts/:id',
          summary: 'Actualizar un post',
          description: 'Todos los campos son opcionales.',
          access: 'owner',
          pathParams: [idParam('ID del post.')],
          body: postBody.map((f) => ({ ...f, required: false })),
          response: postExample,
        },
        { id: 'admin-posts-destroy', method: 'DELETE', path: '/admin/content/posts/:id', summary: 'Eliminar un post', access: 'owner', pathParams: [idParam('ID del post.')] },
        { id: 'admin-post-attributes-index', method: 'GET', path: '/admin/content/posts/:post_id/attributes', summary: 'Listar atributos de un post', access: 'owner', pathParams: [{ name: 'post_id', type: 'string', required: true, description: 'ID del post.' }] },
        {
          id: 'admin-post-attributes-store',
          method: 'POST',
          path: '/admin/content/posts/:post_id/attributes',
          summary: 'Agregar un atributo a un post',
          access: 'owner',
          pathParams: [{ name: 'post_id', type: 'string', required: true, description: 'ID del post.' }],
          body: [
            { name: 'name', type: 'string', required: true, description: 'Clave del atributo.' },
            { name: 'value', type: 'string', required: true, description: 'Valor.' },
            { name: 'type', type: 'string', description: 'Tipo libre para que tu frontend sepa cómo interpretarlo.' },
          ],
          request: `{ "name": "autor_invitado", "value": "Grace Hopper" }`,
        },
        {
          id: 'admin-post-attributes-destroy',
          method: 'DELETE',
          path: '/admin/content/posts/:post_id/attributes/:id',
          summary: 'Eliminar un atributo',
          access: 'owner',
          pathParams: [
            { name: 'post_id', type: 'string', required: true, description: 'ID del post.' },
            idParam('ID del atributo.'),
          ],
        },
        { id: 'admin-attachments-index', method: 'GET', path: '/admin/content/attachments', summary: 'Listar todos los archivos del sitio', access: 'owner', query: [...pagination, { name: 'q', type: 'string', description: 'Búsqueda por nombre.' }], response: paginatedExample(attachmentExample) },
        {
          id: 'admin-attachments-store',
          method: 'POST',
          path: '/admin/content/attachments',
          summary: 'Subir un archivo al sitio',
          access: 'owner',
          multipart: true,
          body: [
            { name: 'name', type: 'string', required: true, description: 'Nombre visible del archivo.' },
            { name: 'file', type: 'file', required: true, description: 'Mismas reglas que la subida de usuario (10 MB).' },
          ],
          response: attachmentExample,
        },
        { id: 'admin-attachments-destroy', method: 'DELETE', path: '/admin/content/attachments/:id', summary: 'Eliminar cualquier archivo del sitio', access: 'owner', pathParams: [idParam('ID del archivo.')] },
      ],
    },
  ],
}

/* -------------------------------------------------------------------------- */
/*                                   SOCIAL                                   */
/* -------------------------------------------------------------------------- */

const commentExample = `{
  "id": "uuid",
  "content": "¡Muy buen artículo!",
  "parentId": null,
  "isEdited": false,
  "active": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  ${userSummary},
  "children": []
}`

const topicExample = `{
  "id": "uuid",
  "name": "¿Cómo despliego mi sitio?",
  "slug": "como-despliego-mi-sitio",
  "group": "preguntas",
  "content": "Tengo una duda…",
  "active": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  ${userSummary}
}`

const socialModule: ApiModule = {
  slug: 'social',
  name: 'Social',
  icon: 'mdi mdi-forum-outline',
  summary: 'Comentarios en hilos sobre tu contenido y foros con temas y respuestas.',
  intro: [
    'Los comentarios se asocian a un recurso comentable (por ahora, posts del módulo Content) y admiten un nivel de respuestas mediante parent_id.',
    'Los temas (topics) funcionan como un foro: se agrupan libremente con el campo group y reciben respuestas (replies).',
    'Moderación: los comentarios y temas nuevos se crean inactivos y solo aparecen en los listados públicos cuando el owner del sitio los aprueba.',
  ],
  groups: [
    {
      id: 'comments',
      title: 'Comentarios',
      endpoints: [
        {
          id: 'comments-index',
          method: 'GET',
          path: '/social/comments',
          summary: 'Listar comentarios de un recurso',
          description: 'Devuelve los comentarios raíz aprobados, en orden cronológico, con sus respuestas aprobadas en children.',
          access: 'public',
          query: [
            { name: 'commentable_type', type: "'ContentPost'", required: true, description: 'Tipo de recurso comentado.' },
            { name: 'commentable_id', type: 'uuid', required: true, description: 'ID del recurso (por ejemplo, el id del post).' },
            ...pagination,
          ],
          response: paginatedExample(commentExample),
        },
        {
          id: 'comments-show',
          method: 'GET',
          path: '/social/comments/:id',
          summary: 'Obtener un comentario con su padre y respuestas',
          access: 'public',
          pathParams: [idParam('ID del comentario.')],
          response: commentExample,
        },
        {
          id: 'comments-store',
          method: 'POST',
          path: '/social/comments',
          summary: 'Crear un comentario',
          access: 'auth',
          body: [
            { name: 'commentable_type', type: "'ContentPost'", required: true, description: 'Tipo de recurso.' },
            { name: 'commentable_id', type: 'uuid', required: true, description: 'ID del recurso.' },
            { name: 'content', type: 'string', required: true, description: 'Texto del comentario.' },
            { name: 'parent_id', type: 'uuid | null', description: 'ID del comentario al que responde.' },
          ],
          request: `{
  "commentable_type": "ContentPost",
  "commentable_id": "uuid-del-post",
  "content": "¡Muy buen artículo!"
}`,
          response: commentExample,
          notes: ['Queda pendiente de moderación (active: false) hasta que el owner lo apruebe.'],
        },
        {
          id: 'comments-update',
          method: 'PUT',
          path: '/social/comments/:id',
          summary: 'Editar un comentario propio',
          access: 'auth',
          pathParams: [idParam('ID del comentario.')],
          body: [{ name: 'content', type: 'string', required: true, description: 'Nuevo texto.' }],
          request: `{ "content": "Texto corregido" }`,
          notes: ['Solo se permite durante los primeros 5 minutos desde su creación; después responde 403. El comentario queda marcado con isEdited: true.'],
        },
      ],
    },
    {
      id: 'topics',
      title: 'Temas y respuestas',
      endpoints: [
        {
          id: 'topics-index',
          method: 'GET',
          path: '/social/topics',
          summary: 'Listar temas aprobados',
          access: 'public',
          query: [
            ...pagination,
            { name: 'group', type: 'string', description: 'Filtra por grupo.' },
            { name: 'q', type: 'string', description: 'Búsqueda en título o contenido.' },
          ],
          response: paginatedExample(topicExample),
        },
        {
          id: 'topics-show',
          method: 'GET',
          path: '/social/topics/:slug',
          summary: 'Obtener un tema con sus respuestas',
          description: 'Las respuestas vienen paginadas, de la más reciente a la más antigua.',
          access: 'public',
          pathParams: [{ name: 'slug', type: 'string', required: true, description: 'Slug del tema.' }],
          query: pagination,
          response: `{
  "topic": ${topicExample.split('\n').join('\n  ')},
  "replies": {
    "meta": { "total": 3, "perPage": 10, "currentPage": 1, "lastPage": 1 },
    "data": [{ "id": "uuid", "content": "Prueba con…", "createdAt": "…", ${userSummary} }]
  }
}`,
        },
        {
          id: 'topics-store',
          method: 'POST',
          path: '/social/topics',
          summary: 'Crear un tema',
          access: 'member',
          body: [
            { name: 'name', type: 'string', required: true, description: 'Título. El slug se genera automáticamente.' },
            { name: 'content', type: 'string', required: true, description: 'Contenido del tema.' },
            { name: 'group', type: 'string', description: 'Grupo o categoría.' },
          ],
          request: `{ "name": "¿Cómo despliego mi sitio?", "content": "Tengo una duda…", "group": "preguntas" }`,
          response: topicExample,
          notes: ['Queda pendiente de moderación hasta que el owner lo apruebe.'],
        },
        {
          id: 'replies-store',
          method: 'POST',
          path: '/social/topics/:slug/replies',
          summary: 'Responder un tema',
          access: 'member',
          pathParams: [{ name: 'slug', type: 'string', required: true, description: 'Slug del tema.' }],
          body: [{ name: 'content', type: 'string', required: true, description: 'Texto de la respuesta.' }],
          request: `{ "content": "Prueba con…" }`,
        },
      ],
    },
    {
      id: 'admin-social',
      title: 'Moderación',
      admin: true,
      description: 'Herramientas para aprobar, ocultar o eliminar la participación de los usuarios.',
      endpoints: [
        {
          id: 'admin-comments-index',
          method: 'GET',
          path: '/admin/social/comments',
          summary: 'Listar todos los comentarios (incluye pendientes)',
          access: 'owner',
          query: [
            ...pagination,
            { name: 'q', type: 'string', description: 'Búsqueda en el contenido.' },
            { name: 'commentable_type', type: 'string', description: 'Filtra por tipo de recurso.' },
            { name: 'commentable_id', type: 'uuid', description: 'Filtra por recurso.' },
          ],
        },
        { id: 'admin-comments-show', method: 'GET', path: '/admin/social/comments/:id', summary: 'Ver un comentario con su hilo', access: 'owner', pathParams: [idParam('ID del comentario.')] },
        {
          id: 'admin-comments-update',
          method: 'PUT',
          path: '/admin/social/comments/:id',
          summary: 'Aprobar u ocultar un comentario',
          access: 'owner',
          pathParams: [idParam('ID del comentario.')],
          body: [{ name: 'active', type: 'boolean', required: true, description: 'true para publicarlo, false para ocultarlo.' }],
          request: `{ "active": true }`,
        },
        { id: 'admin-comments-destroy', method: 'DELETE', path: '/admin/social/comments/:id', summary: 'Eliminar un comentario', access: 'owner', pathParams: [idParam('ID del comentario.')] },
        { id: 'admin-topics-index', method: 'GET', path: '/admin/social/topics', summary: 'Listar todos los temas', access: 'owner', query: [...pagination, { name: 'q', type: 'string', description: 'Búsqueda.' }] },
        { id: 'admin-topics-show', method: 'GET', path: '/admin/social/topics/:id', summary: 'Ver un tema por id', access: 'owner', pathParams: [idParam('ID del tema.')] },
        {
          id: 'admin-topics-update',
          method: 'PUT',
          path: '/admin/social/topics/:id',
          summary: 'Editar, aprobar u ocultar un tema',
          access: 'owner',
          pathParams: [idParam('ID del tema.')],
          body: [
            { name: 'name', type: 'string', description: 'Mínimo 3 caracteres.' },
            { name: 'content', type: 'string', description: 'Contenido.' },
            { name: 'active', type: 'boolean', description: 'Visibilidad pública.' },
          ],
          request: `{ "active": true }`,
        },
        {
          id: 'admin-replies-index',
          method: 'GET',
          path: '/admin/social/topics/:topic_id/replies',
          summary: 'Listar respuestas de un tema',
          access: 'owner',
          pathParams: [{ name: 'topic_id', type: 'string', required: true, description: 'ID del tema.' }],
          query: [
            { name: 'page', type: 'number', description: 'Página (por defecto 1).' },
            { name: 'per_page', type: 'number', description: 'Resultados por página (por defecto 20).' },
            { name: 'q', type: 'string', description: 'Búsqueda.' },
          ],
        },
      ],
    },
  ],
}

/* -------------------------------------------------------------------------- */
/*                                    STORE                                   */
/* -------------------------------------------------------------------------- */

const productExample = `{
  "id": "uuid",
  "slug": "camiseta-negra",
  "name": "Camiseta negra",
  "description": "100% algodón",
  "content": "Descripción larga…",
  "picture": "https://…",
  "price": "45000.00",
  "stock": 20,
  "tags": ["ropa"],
  "sizeW": 30, "sizeH": 2, "sizeD": 40, "weight": 0.2,
  "active": true,
  "attributes": [{ "id": "uuid", "name": "Talla", "value": "M" }]
}`

const orderExample = `{
  "id": "uuid",
  "status": "pending",
  "total": "81000",
  "shippingAddress": { "addressLine1": "Calle 1 # 2-3", "city": "Bogotá" },
  "billingAddress": null,
  "items": [{ "id": "uuid", "productId": "uuid", "quantity": 2, "price": "45000.00" }],
  "createdAt": "2026-01-01T00:00:00.000Z"
}`

const paymentExample = `{
  "id": "uuid",
  "orderId": "uuid",
  "paymentMethod": "credit_card",
  "paymentStatus": "pending",
  "amount": "81000",
  "currency": "COP",
  "transactionId": "txn_abc123"
}`

const addressBody: ApiField[] = [
  { name: 'address_line1', type: 'string', required: true, description: 'Dirección principal.' },
  { name: 'address_line2', type: 'string | null', description: 'Complemento (apto, torre…).' },
  { name: 'city_id', type: 'number | null', description: 'Ciudad.' },
  { name: 'postal_code', type: 'string | null', description: 'Código postal.' },
  { name: 'phone', type: 'string | null', description: 'Teléfono de contacto.' },
  { name: 'comments', type: 'string | null', description: 'Indicaciones para la entrega.' },
]

const productBody: ApiField[] = [
  { name: 'name', type: 'string', required: true, description: 'Nombre. El slug se genera a partir de él.' },
  { name: 'price', type: 'number', required: true, description: 'Precio unitario (≥ 0).' },
  { name: 'stock', type: 'number', required: true, description: 'Unidades disponibles (≥ 0).' },
  { name: 'description', type: 'string | null', description: 'Resumen.' },
  { name: 'content', type: 'string | null', description: 'Descripción larga.' },
  { name: 'picture', type: 'string | null', description: 'URL de la imagen.' },
  { name: 'tags', type: 'string[] | null', description: 'Etiquetas.' },
  { name: 'size_w / size_h / size_d', type: 'number | null', description: 'Dimensiones en cm.' },
  { name: 'weight', type: 'number | null', description: 'Peso en kg.' },
  { name: 'active', type: 'boolean', description: 'Visible en el catálogo público.' },
]

const couponBody: ApiField[] = [
  { name: 'code', type: 'string', required: true, description: 'Código; se guarda en mayúsculas.' },
  { name: 'discount', type: 'number', required: true, description: 'Valor del descuento.' },
  { name: 'discount_type', type: "'percentage' | 'fixed'", required: true, description: 'Porcentaje sobre el subtotal o monto fijo.' },
  { name: 'minimum_order_value', type: 'number | null', description: 'Subtotal mínimo para aplicarlo.' },
  { name: 'expiration_date', type: 'string | null', description: 'Fecha ISO de expiración.' },
  { name: 'active', type: 'boolean', description: 'Si puede usarse.' },
]

const shippingBody: ApiField[] = [
  { name: 'name', type: 'string', required: true, description: 'Nombre de la regla.' },
  { name: 'price', type: 'number', required: true, description: 'Costo base.' },
  { name: 'state_id', type: 'number | null', description: 'Departamento/estado al que aplica.' },
  { name: 'city_id', type: 'number | null', description: 'Ciudad a la que aplica.' },
  { name: 'price_per_kg', type: 'number | null', description: 'Recargo por kilogramo.' },
  { name: 'price_per_cm3', type: 'number | null', description: 'Recargo por volumen.' },
  { name: 'active', type: 'boolean', description: 'Si está vigente.' },
]

const storeModule: ApiModule = {
  slug: 'store',
  name: 'Store',
  icon: 'mdi mdi-cart-outline',
  summary: 'Catálogo de productos, direcciones, pedidos con cupones y registro de pagos.',
  intro: [
    'El catálogo público solo expone productos activos. Los pedidos se calculan siempre en el servidor: tu frontend envía productos y cantidades, y appi toma los precios reales y aplica el cupón.',
    'Flujo típico de checkout: el usuario arma el carrito → POST /store/orders → procesas el cobro con tu pasarela → POST /store/payments para registrar la transacción → el owner confirma el pago y avanza el estado del pedido.',
  ],
  groups: [
    {
      id: 'catalog',
      title: 'Catálogo',
      endpoints: [
        {
          id: 'products-index',
          method: 'GET',
          path: '/store/products',
          summary: 'Listar productos activos',
          access: 'public',
          query: [
            ...pagination,
            { name: 'q', type: 'string', description: 'Búsqueda por nombre o descripción.' },
            { name: 'tags', type: 'string | string[]', description: 'Filtra por etiquetas (todas deben coincidir).' },
          ],
          response: paginatedExample(productExample),
        },
        {
          id: 'products-show',
          method: 'GET',
          path: '/store/products/:slug',
          summary: 'Obtener un producto por slug',
          access: 'public',
          pathParams: [{ name: 'slug', type: 'string', required: true, description: 'Slug del producto.' }],
          response: productExample,
        },
      ],
    },
    {
      id: 'addresses',
      title: 'Direcciones del usuario',
      endpoints: [
        { id: 'addresses-index', method: 'GET', path: '/store/addresses', summary: 'Listar mis direcciones', description: 'Incluye la ciudad y su departamento cuando existen.', access: 'auth' },
        {
          id: 'addresses-store',
          method: 'POST',
          path: '/store/addresses',
          summary: 'Crear una dirección',
          access: 'auth',
          body: addressBody,
          request: `{ "address_line1": "Calle 1 # 2-3", "postal_code": "110111", "phone": "3001234567" }`,
        },
        { id: 'addresses-show', method: 'GET', path: '/store/addresses/:id', summary: 'Obtener una dirección propia', access: 'auth', pathParams: [idParam('ID de la dirección.')] },
        { id: 'addresses-update', method: 'PUT', path: '/store/addresses/:id', summary: 'Actualizar una dirección propia', description: 'Todos los campos son opcionales.', access: 'auth', pathParams: [idParam('ID de la dirección.')], body: addressBody.map((f) => ({ ...f, required: false })) },
        { id: 'addresses-destroy', method: 'DELETE', path: '/store/addresses/:id', summary: 'Eliminar una dirección propia', access: 'auth', pathParams: [idParam('ID de la dirección.')] },
      ],
    },
    {
      id: 'orders',
      title: 'Pedidos y pagos',
      endpoints: [
        { id: 'orders-index', method: 'GET', path: '/store/orders', summary: 'Listar mis pedidos', access: 'auth', query: pagination, response: paginatedExample(orderExample) },
        {
          id: 'orders-store',
          method: 'POST',
          path: '/store/orders',
          summary: 'Crear un pedido',
          access: 'auth',
          body: [
            { name: 'items', type: '{ product_id: string, quantity: number }[]', required: true, description: 'Al menos un item; quantity ≥ 1.' },
            { name: 'shipping_address', type: 'object', description: 'Dirección de envío (objeto libre; puedes copiar una de /store/addresses).' },
            { name: 'billing_address', type: 'object', description: 'Dirección de facturación.' },
            { name: 'coupon_code', type: 'string | null', description: 'Código de cupón (no distingue mayúsculas).' },
          ],
          request: `{
  "items": [{ "product_id": "uuid", "quantity": 2 }],
  "shipping_address": { "addressLine1": "Calle 1 # 2-3", "city": "Bogotá" },
  "coupon_code": "BIENVENIDA10"
}`,
          response: orderExample,
          notes: [
            'El pedido se crea con estado pending.',
            'Responde 400 si algún producto no existe o está inactivo, o si el cupón es inválido, expiró o no alcanza el pedido mínimo.',
          ],
        },
        { id: 'orders-show', method: 'GET', path: '/store/orders/:id', summary: 'Obtener un pedido propio', description: 'Incluye los items con su producto y los pagos registrados.', access: 'auth', pathParams: [idParam('ID del pedido.')] },
        { id: 'payments-index', method: 'GET', path: '/store/payments', summary: 'Listar mis pagos', access: 'auth', query: pagination },
        {
          id: 'payments-store',
          method: 'POST',
          path: '/store/payments',
          summary: 'Registrar un pago',
          access: 'auth',
          body: [
            { name: 'order_id', type: 'string', required: true, description: 'Pedido propio al que corresponde.' },
            { name: 'payment_method', type: 'string', required: true, description: 'Medio de pago (ej. credit_card, pse).' },
            { name: 'amount', type: 'number', required: true, description: 'Monto pagado.' },
            { name: 'currency', type: 'string', description: 'Moneda ISO (por defecto USD).' },
            { name: 'transaction_id', type: 'string | null', description: 'Referencia de la transacción en tu pasarela.' },
          ],
          request: `{ "order_id": "uuid", "payment_method": "credit_card", "amount": 81000, "currency": "COP", "transaction_id": "txn_abc123" }`,
          response: paymentExample,
          notes: ['El pago siempre se registra como pending. Su confirmación la hace el owner (o tu backend con credenciales de owner) tras validar la transacción con la pasarela; nunca marques un pedido como pagado basándote solo en lo que reporta el navegador.'],
        },
        { id: 'payments-show', method: 'GET', path: '/store/payments/:id', summary: 'Obtener un pago propio', access: 'auth', pathParams: [idParam('ID del pago.')], response: paymentExample },
      ],
    },
    {
      id: 'admin-store',
      title: 'Administración de la tienda',
      admin: true,
      endpoints: [
        { id: 'admin-products-index', method: 'GET', path: '/admin/store/products', summary: 'Listar todos los productos', access: 'owner', query: [...pagination, { name: 'q', type: 'string', description: 'Búsqueda.' }] },
        { id: 'admin-products-store', method: 'POST', path: '/admin/store/products', summary: 'Crear un producto', access: 'owner', body: productBody, request: `{ "name": "Camiseta negra", "price": 45000, "stock": 20, "tags": ["ropa"], "active": true }` },
        { id: 'admin-products-show', method: 'GET', path: '/admin/store/products/:id', summary: 'Obtener un producto por id', access: 'owner', pathParams: [idParam('ID del producto.')] },
        { id: 'admin-products-update', method: 'PUT', path: '/admin/store/products/:id', summary: 'Actualizar un producto', access: 'owner', pathParams: [idParam('ID del producto.')], body: productBody.map((f) => ({ ...f, required: false })) },
        { id: 'admin-products-destroy', method: 'DELETE', path: '/admin/store/products/:id', summary: 'Eliminar un producto', access: 'owner', pathParams: [idParam('ID del producto.')] },
        { id: 'admin-product-attributes-index', method: 'GET', path: '/admin/store/products/:product_id/attributes', summary: 'Listar atributos de un producto', access: 'owner', pathParams: [{ name: 'product_id', type: 'string', required: true, description: 'ID del producto.' }] },
        {
          id: 'admin-product-attributes-store',
          method: 'POST',
          path: '/admin/store/products/:product_id/attributes',
          summary: 'Agregar un atributo',
          access: 'owner',
          pathParams: [{ name: 'product_id', type: 'string', required: true, description: 'ID del producto.' }],
          body: [
            { name: 'name', type: 'string', required: true, description: 'Clave (ej. Talla).' },
            { name: 'value', type: 'string', required: true, description: 'Valor (ej. M).' },
          ],
          request: `{ "name": "Talla", "value": "M" }`,
        },
        { id: 'admin-product-attributes-destroy', method: 'DELETE', path: '/admin/store/products/:product_id/attributes/:id', summary: 'Eliminar un atributo', access: 'owner', pathParams: [{ name: 'product_id', type: 'string', required: true, description: 'ID del producto.' }, idParam('ID del atributo.')] },
        { id: 'admin-orders-index', method: 'GET', path: '/admin/store/orders', summary: 'Listar pedidos del sitio', access: 'owner', query: [...pagination, { name: 'status', type: 'string', description: 'Filtra por estado.' }] },
        { id: 'admin-orders-show', method: 'GET', path: '/admin/store/orders/:id', summary: 'Ver un pedido', access: 'owner', pathParams: [idParam('ID del pedido.')] },
        {
          id: 'admin-orders-update',
          method: 'PUT',
          path: '/admin/store/orders/:id',
          summary: 'Cambiar el estado de un pedido',
          access: 'owner',
          pathParams: [idParam('ID del pedido.')],
          body: [{ name: 'status', type: "'pending' | 'paid' | 'shipped' | 'completed' | 'canceled'", required: true, description: 'Nuevo estado.' }],
          request: `{ "status": "shipped" }`,
        },
        { id: 'admin-payments-index', method: 'GET', path: '/admin/store/payments', summary: 'Listar pagos del sitio', access: 'owner', query: [...pagination, { name: 'status', type: 'string', description: 'Filtra por estado.' }] },
        { id: 'admin-payments-show', method: 'GET', path: '/admin/store/payments/:id', summary: 'Ver un pago', access: 'owner', pathParams: [idParam('ID del pago.')] },
        {
          id: 'admin-payments-update',
          method: 'PUT',
          path: '/admin/store/payments/:id',
          summary: 'Confirmar o rechazar un pago',
          access: 'owner',
          pathParams: [idParam('ID del pago.')],
          body: [{ name: 'payment_status', type: "'pending' | 'completed' | 'failed'", required: true, description: 'Nuevo estado del pago.' }],
          request: `{ "payment_status": "completed" }`,
        },
        { id: 'admin-coupons-index', method: 'GET', path: '/admin/store/coupons', summary: 'Listar cupones', access: 'owner', query: pagination },
        { id: 'admin-coupons-store', method: 'POST', path: '/admin/store/coupons', summary: 'Crear un cupón', access: 'owner', body: couponBody, request: `{ "code": "BIENVENIDA10", "discount": 10, "discount_type": "percentage", "minimum_order_value": 50000 }` },
        { id: 'admin-coupons-show', method: 'GET', path: '/admin/store/coupons/:id', summary: 'Obtener un cupón', access: 'owner', pathParams: [idParam('ID del cupón.')] },
        { id: 'admin-coupons-update', method: 'PUT', path: '/admin/store/coupons/:id', summary: 'Actualizar un cupón', access: 'owner', pathParams: [idParam('ID del cupón.')], body: couponBody.map((f) => ({ ...f, required: false })) },
        { id: 'admin-coupons-destroy', method: 'DELETE', path: '/admin/store/coupons/:id', summary: 'Eliminar un cupón', access: 'owner', pathParams: [idParam('ID del cupón.')] },
        { id: 'admin-shipping-index', method: 'GET', path: '/admin/store/shipping-rules', summary: 'Listar reglas de envío', access: 'owner', query: pagination },
        { id: 'admin-shipping-store', method: 'POST', path: '/admin/store/shipping-rules', summary: 'Crear una regla de envío', access: 'owner', body: shippingBody, request: `{ "name": "Envío nacional", "price": 12000, "price_per_kg": 2000 }` },
        { id: 'admin-shipping-show', method: 'GET', path: '/admin/store/shipping-rules/:id', summary: 'Obtener una regla de envío', access: 'owner', pathParams: [idParam('ID de la regla.')] },
        { id: 'admin-shipping-update', method: 'PUT', path: '/admin/store/shipping-rules/:id', summary: 'Actualizar una regla de envío', access: 'owner', pathParams: [idParam('ID de la regla.')], body: shippingBody.map((f) => ({ ...f, required: false })) },
        { id: 'admin-shipping-destroy', method: 'DELETE', path: '/admin/store/shipping-rules/:id', summary: 'Eliminar una regla de envío', access: 'owner', pathParams: [idParam('ID de la regla.')] },
      ],
    },
  ],
}

/* -------------------------------------------------------------------------- */
/*                                    LEARN                                   */
/* -------------------------------------------------------------------------- */

const courseExample = `{
  "id": "uuid",
  "slug": "vue-desde-cero",
  "name": "Vue desde cero",
  "group": "frontend",
  "description": "Aprende Vue 3…",
  "picture": "https://…",
  "video": "https://…",
  "autoEnroll": true,
  "active": true
}`

const lessonExample = `{
  "id": "uuid",
  "slug": "componentes",
  "name": "Componentes",
  "description": "…",
  "format": "markdown",
  "content": "## Componentes…",
  "activity": "Crea un componente…",
  "video": "https://…",
  "order": 2,
  "active": true,
  "limitDate": null
}`

const lessonBody: ApiField[] = [
  { name: 'name', type: 'string', required: true, description: 'Título. El slug se genera a partir de él.' },
  { name: 'description', type: 'string | null', description: 'Resumen.' },
  { name: 'format', type: "'text' | 'html' | 'markdown'", description: 'Formato del contenido.' },
  { name: 'content', type: 'string | null', description: 'Contenido de la lección.' },
  { name: 'activity', type: 'string | null', description: 'Enunciado de la actividad entregable. Si es null, la lección no recibe entregas.' },
  { name: 'video', type: 'string | null', description: 'URL de video.' },
  { name: 'order', type: 'number', description: 'Posición dentro del curso.' },
  { name: 'active', type: 'boolean', description: 'Visible para estudiantes.' },
  { name: 'limit_date', type: 'string | null', description: 'Fecha límite ISO para actividad y cuestionario.' },
]

const questionBody: ApiField[] = [
  { name: 'name', type: 'string', required: true, description: 'Enunciado.' },
  { name: 'response_1, response_2', type: 'string', required: true, description: 'Opciones obligatorias.' },
  { name: 'response_3 … response_5', type: 'string | null', description: 'Opciones adicionales.' },
  { name: 'response_correct', type: 'number (1-5)', required: true, description: 'Número de la opción correcta.' },
  { name: 'description', type: 'string | null', description: 'Contexto adicional.' },
  { name: 'picture', type: 'string | null', description: 'URL de imagen.' },
  { name: 'attachment', type: 'string | null', description: 'URL de archivo de apoyo.' },
]

const learnModule: ApiModule = {
  slug: 'learn',
  name: 'Learn',
  icon: 'mdi mdi-school-outline',
  summary: 'Cursos con lecciones, actividades entregables, cuestionarios autocalificados e inscripciones con progreso.',
  intro: [
    'Las rutas públicas identifican cursos y lecciones por slug (/learn/courses/vue-desde-cero/lessons/componentes). Las rutas de administración usan ids.',
    'Cada curso tiene sus propios roles, independientes del rol en el sitio: student (cursa), teacher (gestiona lecciones, preguntas y califica) y admin (además puede eliminar). Un usuario puede autoinscribirse como student si el curso tiene autoEnroll activo; los demás roles los asigna el owner del sitio.',
    'El progreso del estudiante (0–100) se recalcula automáticamente cuando ve una lección, envía una actividad o completa un cuestionario.',
  ],
  groups: [
    {
      id: 'catalog',
      title: 'Cursos e inscripción',
      endpoints: [
        {
          id: 'courses-index',
          method: 'GET',
          path: '/learn/courses',
          summary: 'Listar cursos activos',
          access: 'public',
          query: [...pagination, { name: 'group', type: 'string', description: 'Filtra por grupo.' }],
          response: paginatedExample(courseExample),
        },
        {
          id: 'courses-show',
          method: 'GET',
          path: '/learn/courses/:course',
          summary: 'Obtener un curso',
          description: 'Si la petición incluye un token, agrega la inscripción del usuario en enrollment (o null si no está inscrito).',
          access: 'optional',
          pathParams: [courseSlug],
          response: extendExample(courseExample, `"enrollment": { "id": "uuid", "role": "student", "status": "active", "progress": "40" }`),
        },
        {
          id: 'enrollments-store',
          method: 'POST',
          path: '/learn/courses/:course/enrollments',
          summary: 'Autoinscribirse en un curso',
          description: 'Inscribe al usuario como student con estado active. Solo funciona si el curso tiene autoEnroll.',
          access: 'auth',
          pathParams: [courseSlug],
          notes: ['Responde 400 si el curso no permite autoinscripción o si el usuario ya está inscrito.'],
        },
        { id: 'enrollments-index', method: 'GET', path: '/learn/courses/:course/enrollments', summary: 'Listar inscritos del curso', access: 'staff', pathParams: [courseSlug], query: pagination },
        { id: 'enrollments-show', method: 'GET', path: '/learn/courses/:course/enrollments/:id', summary: 'Ver una inscripción', access: 'staff', pathParams: [courseSlug, idParam('ID de la inscripción.')] },
      ],
    },
    {
      id: 'my-learning',
      title: 'Mi aprendizaje',
      description: 'Rutas para armar el panel del estudiante: los cursos en los que está inscrito y las lecciones que ya completó, en todos los cursos del sitio.',
      endpoints: [
        {
          id: 'user-courses',
          method: 'GET',
          path: '/learn/user/courses',
          summary: 'Listar mis cursos',
          description: 'Cursos activos del sitio en los que el usuario autenticado está inscrito (con cualquier rol), del más reciente al más antiguo. Cada curso incluye en enrollments la inscripción del propio usuario.',
          access: 'auth',
          query: pagination,
          response: paginatedExample(extendExample(courseExample, `"enrollments": [
    { "id": "uuid", "role": "student", "status": "active", "progress": "40" }
  ]`)),
        },
        {
          id: 'user-lessons',
          method: 'GET',
          path: '/learn/user/lessons',
          summary: 'Listar mis lecciones completadas',
          description: 'Lecciones que el usuario autenticado ya vio al menos una vez (el mismo criterio con el que se calcula el progreso), ordenadas por fecha de creación de la lección descendente. Cada lección incluye su curso en course.',
          access: 'auth',
          query: pagination,
          response: paginatedExample(extendExample(lessonExample, `"course": { "id": "uuid", "slug": "vue-desde-cero", "name": "Vue desde cero", … }`)),
          notes: ['Una lección cuenta como completada al abrirla con GET /learn/courses/:course/lessons/:lesson usando el token del estudiante.'],
        },
      ],
    },
    {
      id: 'lessons',
      title: 'Lecciones',
      endpoints: [
        {
          id: 'lessons-index',
          method: 'GET',
          path: '/learn/courses/:course/lessons',
          summary: 'Listar lecciones',
          description: 'Ordenadas por order. Los teachers/admins del curso ven también las inactivas.',
          access: 'optional',
          pathParams: [courseSlug],
          query: pagination,
          response: paginatedExample(lessonExample),
        },
        {
          id: 'lessons-show',
          method: 'GET',
          path: '/learn/courses/:course/lessons/:lesson',
          summary: 'Ver una lección',
          description: 'Si el usuario está inscrito, registra la vista, actualiza su progreso y agrega su entrega (myAnswer), su último intento de cuestionario (myQuiz) y las preguntas del cuestionario sin la respuesta correcta (quizQuestions).',
          access: 'optional',
          pathParams: [courseSlug, lessonSlug],
          response: extendExample(lessonExample, `"myAnswer": { "id": "uuid", "answer": "Mi solución…", "attachment": null, "feedback": "¡Bien!", "result": "90" },
  "myQuiz": { "id": "uuid", "status": "completed", "results": "75", "answers": "[…]" },
  "quizQuestions": [
    { "id": "uuid", "name": "¿Qué es un prop?", "description": null, "picture": null,
      "response_1": "…", "response_2": "…", "response_3": "…", "response_4": null, "response_5": null }
  ]`),
          notes: ['Para mostrar la lección como "vista" basta con llamar este endpoint con el token del estudiante.'],
        },
        { id: 'lessons-store', method: 'POST', path: '/learn/courses/:course/lessons', summary: 'Crear una lección', access: 'staff', pathParams: [courseSlug], body: lessonBody, request: `{ "name": "Componentes", "format": "markdown", "content": "## Componentes…", "order": 2, "active": true }` },
        { id: 'lessons-update', method: 'PUT', path: '/learn/courses/:course/lessons/:lesson', summary: 'Actualizar una lección', access: 'staff', pathParams: [courseSlug, lessonSlug], body: lessonBody.map((f) => ({ ...f, required: false })) },
        { id: 'lessons-destroy', method: 'DELETE', path: '/learn/courses/:course/lessons/:lesson', summary: 'Eliminar una lección', access: 'course-admin', pathParams: [courseSlug, lessonSlug] },
      ],
    },
    {
      id: 'activities',
      title: 'Actividades y cuestionarios',
      description: 'Una lección puede tener una actividad abierta (texto y/o archivo, calificada por un teacher) y un cuestionario de selección múltiple que appi califica automáticamente.',
      endpoints: [
        {
          id: 'answers-store',
          method: 'POST',
          path: '/learn/courses/:course/lessons/:lesson/answers',
          summary: 'Entregar la actividad de una lección',
          access: 'student',
          pathParams: [courseSlug, lessonSlug],
          body: [
            { name: 'answer', type: 'string', required: true, description: 'Respuesta del estudiante.' },
            { name: 'attachment', type: 'string | null', description: 'URL de un archivo (puedes subirlo antes con /content/attachments).' },
          ],
          request: `{ "answer": "Mi solución…", "attachment": "https://…/entrega.pdf" }`,
          notes: ['Una sola entrega por lección. Responde 400 si la lección no tiene actividad, si pasó la fecha límite o si ya entregaste.'],
        },
        { id: 'answers-show', method: 'GET', path: '/learn/courses/:course/lessons/:lesson/answers/:id', summary: 'Ver una entrega', description: 'El estudiante solo puede ver la suya.', access: 'student-staff', pathParams: [courseSlug, lessonSlug, idParam('ID de la entrega.')] },
        { id: 'answers-index', method: 'GET', path: '/learn/courses/:course/lessons/:lesson/answers', summary: 'Listar entregas de la lección', access: 'staff', pathParams: [courseSlug, lessonSlug], query: pagination },
        {
          id: 'answers-update',
          method: 'PUT',
          path: '/learn/courses/:course/lessons/:lesson/answers/:id',
          summary: 'Calificar una entrega',
          access: 'staff',
          pathParams: [courseSlug, lessonSlug, idParam('ID de la entrega.')],
          body: [
            { name: 'feedback', type: 'string | null', description: 'Retroalimentación para el estudiante.' },
            { name: 'result', type: 'number (0-100) | null', description: 'Nota.' },
          ],
          request: `{ "feedback": "¡Bien!", "result": 90 }`,
        },
        { id: 'answers-destroy', method: 'DELETE', path: '/learn/courses/:course/lessons/:lesson/answers/:id', summary: 'Eliminar una entrega', access: 'course-admin', pathParams: [courseSlug, lessonSlug, idParam('ID de la entrega.')] },
        {
          id: 'quizzes-store',
          method: 'POST',
          path: '/learn/courses/:course/lessons/:lesson/quizzes',
          summary: 'Enviar un intento de cuestionario',
          description: 'Envía en una sola petición la opción elegida para cada pregunta de quizQuestions. appi califica, guarda el intento y actualiza el progreso. Se permiten varios intentos.',
          access: 'student',
          pathParams: [courseSlug, lessonSlug],
          body: [{ name: 'answers', type: '{ question_id: string, selected: 1-5 }[]', required: true, description: 'Exactamente una respuesta por cada pregunta vinculada a la lección.' }],
          request: `{
  "answers": [
    { "question_id": "uuid-1", "selected": 2 },
    { "question_id": "uuid-2", "selected": 4 }
  ]
}`,
          response: `{
  "id": "uuid",
  "status": "completed",
  "results": "50",
  "answers": "[{\\"question_id\\":\\"uuid-1\\",\\"selected\\":2,\\"correct\\":true}, …]",
  "questions": "[…]"
}`,
          notes: [
            'answers y questions llegan como JSON serializado en string: usa JSON.parse.',
            'Responde 400 si faltan o sobran preguntas, si la lección no tiene preguntas o si pasó la fecha límite.',
          ],
        },
        { id: 'quizzes-show', method: 'GET', path: '/learn/courses/:course/lessons/:lesson/quizzes/:id', summary: 'Ver un intento', description: 'El estudiante solo puede ver los suyos.', access: 'student-staff', pathParams: [courseSlug, lessonSlug, idParam('ID del intento.')] },
        { id: 'quizzes-index', method: 'GET', path: '/learn/courses/:course/lessons/:lesson/quizzes', summary: 'Listar intentos de la lección', access: 'staff', pathParams: [courseSlug, lessonSlug], query: pagination },
        {
          id: 'quizzes-update',
          method: 'PUT',
          path: '/learn/courses/:course/lessons/:lesson/quizzes/:id',
          summary: 'Corregir un intento',
          access: 'staff',
          pathParams: [courseSlug, lessonSlug, idParam('ID del intento.')],
          body: [
            { name: 'status', type: "'pending' | 'completed'", description: 'Estado del intento.' },
            { name: 'results', type: 'number (0-100) | null', description: 'Nota.' },
          ],
        },
        { id: 'quizzes-destroy', method: 'DELETE', path: '/learn/courses/:course/lessons/:lesson/quizzes/:id', summary: 'Eliminar un intento', access: 'course-admin', pathParams: [courseSlug, lessonSlug, idParam('ID del intento.')] },
      ],
    },
    {
      id: 'question-bank',
      title: 'Banco de preguntas del curso',
      description: 'Preguntas de selección múltiple reutilizables entre lecciones. appi lleva estadísticas de aciertos (wons), fallos (losses) y dificultad (% de fallos).',
      endpoints: [
        { id: 'questions-index', method: 'GET', path: '/learn/courses/:course/questions', summary: 'Listar preguntas', access: 'staff', pathParams: [courseSlug], query: pagination },
        { id: 'questions-show', method: 'GET', path: '/learn/courses/:course/questions/:id', summary: 'Ver una pregunta', access: 'staff', pathParams: [courseSlug, idParam('ID de la pregunta.')] },
        { id: 'questions-store', method: 'POST', path: '/learn/courses/:course/questions', summary: 'Crear una pregunta', access: 'course-admin', pathParams: [courseSlug], body: questionBody, request: `{ "name": "¿Qué es un prop?", "response_1": "Un dato que recibe el componente", "response_2": "Un evento", "response_correct": 1 }` },
        { id: 'questions-update', method: 'PUT', path: '/learn/courses/:course/questions/:id', summary: 'Actualizar una pregunta', access: 'staff', pathParams: [courseSlug, idParam('ID de la pregunta.')], body: questionBody.map((f) => ({ ...f, required: false })) },
        { id: 'questions-destroy', method: 'DELETE', path: '/learn/courses/:course/questions/:id', summary: 'Eliminar una pregunta', access: 'course-admin', pathParams: [courseSlug, idParam('ID de la pregunta.')] },
      ],
    },
    {
      id: 'admin-learn',
      title: 'Administración de cursos',
      admin: true,
      description: 'Gestión de todos los cursos del sitio por id, incluyendo la asignación de roles de curso y la vinculación de preguntas a lecciones.',
      endpoints: [
        { id: 'admin-courses-index', method: 'GET', path: '/admin/learn/courses', summary: 'Listar cursos', access: 'owner', query: [...pagination, { name: 'q', type: 'string', description: 'Búsqueda.' }, { name: 'group', type: 'string', description: 'Filtra por grupo.' }] },
        {
          id: 'admin-courses-store',
          method: 'POST',
          path: '/admin/learn/courses',
          summary: 'Crear un curso',
          access: 'owner',
          body: [
            { name: 'name', type: 'string', required: true, description: 'Nombre. El slug se genera a partir de él.' },
            { name: 'group', type: 'string | null', description: 'Grupo o categoría.' },
            { name: 'description', type: 'string | null', description: 'Descripción.' },
            { name: 'picture', type: 'string | null', description: 'URL de imagen.' },
            { name: 'video', type: 'string | null', description: 'URL de video introductorio.' },
            { name: 'auto_enroll', type: 'boolean', description: 'Permite autoinscripción.' },
            { name: 'active', type: 'boolean', description: 'Visible en el catálogo.' },
          ],
          request: `{ "name": "Vue desde cero", "group": "frontend", "auto_enroll": true, "active": true }`,
        },
        { id: 'admin-courses-show', method: 'GET', path: '/admin/learn/courses/:id', summary: 'Obtener un curso', access: 'owner', pathParams: [idParam('ID del curso.')] },
        { id: 'admin-courses-update', method: 'PUT', path: '/admin/learn/courses/:id', summary: 'Actualizar un curso', access: 'owner', pathParams: [idParam('ID del curso.')] },
        { id: 'admin-courses-destroy', method: 'DELETE', path: '/admin/learn/courses/:id', summary: 'Eliminar un curso', access: 'owner', pathParams: [idParam('ID del curso.')] },
        { id: 'admin-lessons', method: 'GET', path: '/admin/learn/courses/:course_id/lessons', summary: 'CRUD de lecciones (index, store, show, update, destroy)', description: 'Mismos campos que la creación de lecciones del curso; disponible también con POST, GET/:id, PUT/:id y DELETE/:id.', access: 'owner', pathParams: [{ name: 'course_id', type: 'string', required: true, description: 'ID del curso.' }] },
        { id: 'admin-questions', method: 'GET', path: '/admin/learn/courses/:course_id/questions', summary: 'CRUD del banco de preguntas', description: 'Disponible con POST, GET/:id, PUT/:id y DELETE/:id.', access: 'owner', pathParams: [{ name: 'course_id', type: 'string', required: true, description: 'ID del curso.' }] },
        { id: 'admin-exam-questions-index', method: 'GET', path: '/admin/learn/courses/:course_id/lessons/:lesson_id/exam-questions', summary: 'Listar preguntas vinculadas a una lección', access: 'owner', pathParams: [{ name: 'course_id', type: 'string', required: true, description: 'ID del curso.' }, { name: 'lesson_id', type: 'string', required: true, description: 'ID de la lección.' }] },
        {
          id: 'admin-exam-questions-store',
          method: 'POST',
          path: '/admin/learn/courses/:course_id/lessons/:lesson_id/exam-questions',
          summary: 'Vincular una pregunta al cuestionario de la lección',
          access: 'owner',
          pathParams: [{ name: 'course_id', type: 'string', required: true, description: 'ID del curso.' }, { name: 'lesson_id', type: 'string', required: true, description: 'ID de la lección.' }],
          body: [{ name: 'question_id', type: 'string', required: true, description: 'Pregunta del banco del mismo curso.' }],
          request: `{ "question_id": "uuid" }`,
        },
        { id: 'admin-exam-questions-destroy', method: 'DELETE', path: '/admin/learn/courses/:course_id/lessons/:lesson_id/exam-questions/:id', summary: 'Desvincular una pregunta', access: 'owner', pathParams: [{ name: 'course_id', type: 'string', required: true, description: 'ID del curso.' }, { name: 'lesson_id', type: 'string', required: true, description: 'ID de la lección.' }, idParam('ID del vínculo.')] },
        { id: 'admin-answers', method: 'GET', path: '/admin/learn/courses/:course_id/lessons/:lesson_id/answers', summary: 'CRUD de entregas', description: 'Disponible con POST (registrar una entrega a nombre de user_id), GET/:id, PUT/:id (calificar) y DELETE/:id.', access: 'owner', pathParams: [{ name: 'course_id', type: 'string', required: true, description: 'ID del curso.' }, { name: 'lesson_id', type: 'string', required: true, description: 'ID de la lección.' }] },
        { id: 'admin-quizzes', method: 'GET', path: '/admin/learn/courses/:course_id/lessons/:lesson_id/quizzes', summary: 'Intentos de cuestionario', description: 'Disponible con GET/:id, PUT/:id (status, results) y DELETE/:id.', access: 'owner', pathParams: [{ name: 'course_id', type: 'string', required: true, description: 'ID del curso.' }, { name: 'lesson_id', type: 'string', required: true, description: 'ID de la lección.' }] },
        { id: 'admin-enrollments-index', method: 'GET', path: '/admin/learn/enrollments', summary: 'Listar inscripciones del sitio', access: 'owner', query: [...pagination, { name: 'course_id', type: 'string', description: 'Filtra por curso.' }, { name: 'role', type: 'string', description: 'Filtra por rol.' }, { name: 'status', type: 'string', description: 'Filtra por estado.' }] },
        {
          id: 'admin-enrollments-store',
          method: 'POST',
          path: '/admin/learn/enrollments',
          summary: 'Inscribir un usuario o asignarle un rol de curso',
          access: 'owner',
          body: [
            { name: 'course_id', type: 'string', required: true, description: 'ID del curso.' },
            { name: 'user_id', type: 'string', required: true, description: 'Usuario del sitio (búscalo con /admin/learn/site-users).' },
            { name: 'role', type: "'student' | 'teacher' | 'admin'", description: 'Rol en el curso.' },
            { name: 'status', type: "'pending' | 'active' | 'completed' | 'canceled'", description: 'Estado de la inscripción.' },
          ],
          request: `{ "course_id": "uuid", "user_id": "uuid", "role": "teacher", "status": "active" }`,
        },
        { id: 'admin-enrollments-show', method: 'GET', path: '/admin/learn/enrollments/:id', summary: 'Ver una inscripción', access: 'owner', pathParams: [idParam('ID de la inscripción.')] },
        {
          id: 'admin-enrollments-update',
          method: 'PUT',
          path: '/admin/learn/enrollments/:id',
          summary: 'Cambiar rol, estado o progreso',
          access: 'owner',
          pathParams: [idParam('ID de la inscripción.')],
          body: [
            { name: 'role', type: "'student' | 'teacher' | 'admin'", description: 'Rol en el curso.' },
            { name: 'status', type: "'pending' | 'active' | 'completed' | 'canceled'", description: 'Estado.' },
            { name: 'progress', type: 'number (0-100)', description: 'Progreso manual.' },
          ],
        },
        { id: 'admin-enrollments-destroy', method: 'DELETE', path: '/admin/learn/enrollments/:id', summary: 'Eliminar una inscripción', access: 'owner', pathParams: [idParam('ID de la inscripción.')] },
        { id: 'admin-site-users', method: 'GET', path: '/admin/learn/site-users', summary: 'Buscar usuarios del sitio', description: 'Para elegir a quién inscribir o asignar como teacher/admin.', access: 'owner', query: [{ name: 'q', type: 'string', description: 'Nombre o email.' }] },
      ],
    },
  ],
}

export const appiModules: ApiModule[] = [authModule, contentModule, socialModule, storeModule, learnModule]

export function findAppiModule(slug: string) {
  return appiModules.find((m) => m.slug === slug)
}
