import { z } from 'zod'
import type { AppiCall } from '#services/mcp/appi_client'
import { pagination, path, type ToolServer } from '#services/mcp/shared'

const postFields = {
  description: z.string().nullable().optional().describe('Resumen corto del post'),
  content: z.string().nullable().optional().describe('Cuerpo del post en el formato indicado'),
  format: z.enum(['markdown', 'html', 'plaintext']).optional().describe('Formato de content'),
  tags: z.array(z.string()).nullable().optional().describe('Etiquetas del post'),
  picture: z.string().nullable().optional().describe('URL de la imagen principal'),
  active: z.boolean().optional().describe('true = publicado, false = borrador'),
}

/**
 * Tools for the content module. Each one maps 1:1 to an existing route in
 * start/routes.ts (public `content/*` and owner-only `admin/content/*`).
 * File uploads (multipart) and bulk imports are intentionally not exposed.
 */
export function registerContentTools(server: ToolServer, call: AppiCall) {
  // Public

  server.registerTool(
    'list_posts',
    {
      title: 'Listar posts publicados',
      description: 'Lista los posts publicados del sitio, del más reciente al más antiguo.',
      inputSchema: {
        q: z.string().optional().describe('Búsqueda por nombre o descripción'),
        tags: z
          .array(z.string())
          .optional()
          .describe('Solo posts que tengan todas estas etiquetas'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'content/posts', { query: args })
  )

  server.registerTool(
    'get_post',
    {
      title: 'Ver post publicado',
      description: 'Obtiene un post publicado por su slug, con autor y atributos.',
      inputSchema: { slug: z.string().describe('Slug del post') },
      annotations: { readOnlyHint: true },
    },
    ({ slug }) => call('GET', path`content/posts/${slug}`)
  )

  server.registerTool(
    'list_my_attachments',
    {
      title: 'Listar mis archivos',
      description: 'Lista los archivos subidos por el usuario autenticado en este sitio.',
      inputSchema: { ...pagination },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'content/attachments', { query: args })
  )

  server.registerTool(
    'delete_my_attachment',
    {
      title: 'Eliminar mi archivo',
      description: 'Elimina un archivo subido por el usuario autenticado (también del storage).',
      inputSchema: { id: z.string().describe('ID del attachment') },
      annotations: { destructiveHint: true },
    },
    ({ id }) => call('DELETE', path`content/attachments/${id}`)
  )

  // Admin (site owner only — enforced by the adminSite middleware on the target route)

  server.registerTool(
    'admin_list_posts',
    {
      title: '[Admin] Listar posts',
      description: 'Lista todos los posts del sitio, incluidos los borradores. Requiere ser owner.',
      inputSchema: {
        q: z.string().optional().describe('Búsqueda por nombre o descripción'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'admin/content/posts', { query: args })
  )

  server.registerTool(
    'admin_get_post',
    {
      title: '[Admin] Ver post',
      description:
        'Obtiene un post por ID (publicado o borrador) con autor y atributos. Requiere ser owner.',
      inputSchema: { id: z.string().describe('ID del post') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`admin/content/posts/${id}`)
  )

  server.registerTool(
    'admin_create_post',
    {
      title: '[Admin] Crear post',
      description:
        'Crea un post. El slug se genera a partir del nombre. Por defecto queda como borrador (active=false). Requiere ser owner.',
      inputSchema: { name: z.string().describe('Título del post'), ...postFields },
    },
    (args) =>
      call('POST', 'admin/content/posts', {
        // The validator requires these keys to be present (nullable, not optional)
        body: { ...args, description: args.description ?? null, tags: args.tags ?? null },
      })
  )

  server.registerTool(
    'admin_update_post',
    {
      title: '[Admin] Actualizar post',
      description:
        'Actualiza solo los campos enviados de un post (tags: null las borra). Requiere ser owner.',
      inputSchema: {
        id: z.string().describe('ID del post'),
        name: z.string().optional().describe('Título del post'),
        ...postFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...body }) => call('PUT', path`admin/content/posts/${id}`, { body })
  )

  server.registerTool(
    'admin_delete_post',
    {
      title: '[Admin] Eliminar post',
      description: 'Elimina un post definitivamente. Requiere ser owner.',
      inputSchema: { id: z.string().describe('ID del post') },
      annotations: { destructiveHint: true },
    },
    ({ id }) => call('DELETE', path`admin/content/posts/${id}`)
  )

  server.registerTool(
    'admin_list_post_attributes',
    {
      title: '[Admin] Listar atributos de un post',
      description: 'Lista los atributos clave-valor personalizados de un post. Requiere ser owner.',
      inputSchema: { post_id: z.string().describe('ID del post') },
      annotations: { readOnlyHint: true },
    },
    ({ post_id: postId }) => call('GET', path`admin/content/posts/${postId}/attributes`)
  )

  server.registerTool(
    'admin_add_post_attribute',
    {
      title: '[Admin] Agregar atributo a un post',
      description: 'Agrega un atributo clave-valor personalizado a un post. Requiere ser owner.',
      inputSchema: {
        post_id: z.string().describe('ID del post'),
        name: z.string().describe('Nombre del atributo'),
        value: z.string().describe('Valor del atributo'),
        type: z.string().optional().describe('Tipo del valor (default string)'),
      },
    },
    ({ post_id: postId, ...body }) =>
      call('POST', path`admin/content/posts/${postId}/attributes`, { body })
  )

  server.registerTool(
    'admin_delete_post_attribute',
    {
      title: '[Admin] Eliminar atributo de un post',
      description: 'Elimina un atributo de un post. Requiere ser owner.',
      inputSchema: {
        post_id: z.string().describe('ID del post'),
        id: z.string().describe('ID del atributo'),
      },
      annotations: { destructiveHint: true },
    },
    ({ post_id: postId, id }) =>
      call('DELETE', path`admin/content/posts/${postId}/attributes/${id}`)
  )

  server.registerTool(
    'admin_list_attachments',
    {
      title: '[Admin] Listar archivos',
      description: 'Lista todos los archivos del sitio (de cualquier usuario). Requiere ser owner.',
      inputSchema: { q: z.string().optional().describe('Búsqueda por nombre'), ...pagination },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'admin/content/attachments', { query: args })
  )

  server.registerTool(
    'admin_delete_attachment',
    {
      title: '[Admin] Eliminar archivo',
      description: 'Elimina un archivo del sitio (también del storage). Requiere ser owner.',
      inputSchema: { id: z.string().describe('ID del attachment') },
      annotations: { destructiveHint: true },
    },
    ({ id }) => call('DELETE', path`admin/content/attachments/${id}`)
  )
}
