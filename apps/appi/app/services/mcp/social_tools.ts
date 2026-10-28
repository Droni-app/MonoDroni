import { z } from 'zod'
import type { AppiCall } from '#services/mcp/appi_client'
import { pagination, path, type ToolServer } from '#services/mcp/shared'
import { COMMENTABLE_TYPES } from '#validators/social/comment'

const commentableType = z
  .enum(COMMENTABLE_TYPES)
  .describe('Tipo de recurso comentado (ContentPost = post de content)')

/**
 * Tools for the social module: public `social/*` and owner-only `admin/social/*`.
 */
export function registerSocialTools(server: ToolServer, call: AppiCall) {
  // Public

  server.registerTool(
    'list_comments',
    {
      title: 'Listar comentarios',
      description: 'Lista los comentarios activos de un recurso (por ejemplo un post).',
      inputSchema: {
        commentable_type: commentableType,
        commentable_id: z.string().describe('ID del recurso comentado'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'social/comments', { query: args })
  )

  server.registerTool(
    'get_comment',
    {
      title: 'Ver comentario',
      description: 'Obtiene un comentario aprobado con sus respuestas aprobadas.',
      inputSchema: { id: z.string().describe('ID del comentario') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`social/comments/${id}`)
  )

  server.registerTool(
    'create_comment',
    {
      title: 'Comentar',
      description:
        'Publica un comentario en un recurso, o responde a otro comentario con parent_id. Queda oculto hasta que un admin lo apruebe (admin_moderate_comment). Requiere usuario autenticado.',
      inputSchema: {
        commentable_type: commentableType,
        commentable_id: z.string().describe('ID del recurso comentado'),
        content: z.string().min(1).describe('Texto del comentario'),
        parent_id: z.string().optional().describe('ID del comentario al que se responde'),
      },
    },
    (body) => call('POST', 'social/comments', { body })
  )

  server.registerTool(
    'update_my_comment',
    {
      title: 'Editar mi comentario',
      description:
        'Edita un comentario propio. Solo se permite durante los 5 minutos siguientes a publicarlo.',
      inputSchema: {
        id: z.string().describe('ID del comentario'),
        content: z.string().min(1).describe('Nuevo texto'),
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...body }) => call('PUT', path`social/comments/${id}`, { body })
  )

  server.registerTool(
    'list_topics',
    {
      title: 'Listar topics',
      description: 'Lista los topics (hilos de foro) activos del sitio.',
      inputSchema: {
        q: z.string().optional().describe('Búsqueda por nombre o contenido'),
        group: z.string().optional().describe('Filtrar por grupo'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'social/topics', { query: args })
  )

  server.registerTool(
    'get_topic',
    {
      title: 'Ver topic',
      description: 'Obtiene un topic por slug con sus respuestas paginadas.',
      inputSchema: { slug: z.string().describe('Slug del topic'), ...pagination },
      annotations: { readOnlyHint: true },
    },
    ({ slug, ...query }) => call('GET', path`social/topics/${slug}`, { query })
  )

  server.registerTool(
    'create_topic',
    {
      title: 'Crear topic',
      description:
        'Abre un nuevo topic en el foro. Queda oculto hasta que un admin lo active (admin_update_topic). Requiere estar inscrito en el sitio.',
      inputSchema: {
        name: z.string().min(1).describe('Título del topic'),
        content: z.string().min(1).describe('Contenido del topic'),
        group: z.string().optional().describe('Grupo del topic'),
      },
    },
    (body) => call('POST', 'social/topics', { body })
  )

  server.registerTool(
    'reply_to_topic',
    {
      title: 'Responder topic',
      description: 'Publica una respuesta en un topic. Requiere estar inscrito en el sitio.',
      inputSchema: {
        topic_slug: z.string().describe('Slug del topic'),
        content: z.string().min(1).describe('Texto de la respuesta'),
      },
    },
    ({ topic_slug: topicSlug, ...body }) =>
      call('POST', path`social/topics/${topicSlug}/replies`, { body })
  )

  // Admin (site owner only — enforced by the adminSite middleware on the target route)

  server.registerTool(
    'admin_list_comments',
    {
      title: '[Admin] Listar comentarios',
      description:
        'Lista todos los comentarios del sitio, incluidos los ocultos. Requiere ser owner.',
      inputSchema: {
        q: z.string().optional().describe('Búsqueda por contenido'),
        commentable_type: commentableType.optional(),
        commentable_id: z.string().optional().describe('Filtrar por ID del recurso'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'admin/social/comments', { query: args })
  )

  server.registerTool(
    'admin_get_comment',
    {
      title: '[Admin] Ver comentario',
      description: 'Obtiene un comentario con su hilo completo. Requiere ser owner.',
      inputSchema: { id: z.string().describe('ID del comentario') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`admin/social/comments/${id}`)
  )

  server.registerTool(
    'admin_moderate_comment',
    {
      title: '[Admin] Moderar comentario',
      description:
        'Muestra (active=true) u oculta (active=false) un comentario. Requiere ser owner.',
      inputSchema: {
        id: z.string().describe('ID del comentario'),
        active: z.boolean().describe('true = visible, false = oculto'),
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...body }) => call('PUT', path`admin/social/comments/${id}`, { body })
  )

  server.registerTool(
    'admin_delete_comment',
    {
      title: '[Admin] Eliminar comentario',
      description: 'Elimina un comentario definitivamente. Requiere ser owner.',
      inputSchema: { id: z.string().describe('ID del comentario') },
      annotations: { destructiveHint: true },
    },
    ({ id }) => call('DELETE', path`admin/social/comments/${id}`)
  )

  server.registerTool(
    'admin_list_topics',
    {
      title: '[Admin] Listar topics',
      description: 'Lista todos los topics del sitio, incluidos los inactivos. Requiere ser owner.',
      inputSchema: {
        q: z.string().optional().describe('Búsqueda por nombre o contenido'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'admin/social/topics', { query: args })
  )

  server.registerTool(
    'admin_get_topic',
    {
      title: '[Admin] Ver topic',
      description: 'Obtiene un topic por ID. Requiere ser owner.',
      inputSchema: { id: z.string().describe('ID del topic') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`admin/social/topics/${id}`)
  )

  server.registerTool(
    'admin_update_topic',
    {
      title: '[Admin] Actualizar topic',
      description:
        'Edita el nombre o contenido de un topic, o lo activa/desactiva. Requiere ser owner.',
      inputSchema: {
        id: z.string().describe('ID del topic'),
        name: z.string().min(3).optional().describe('Título'),
        content: z.string().min(1).optional().describe('Contenido'),
        active: z.boolean().optional().describe('true = visible, false = oculto'),
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...body }) => call('PUT', path`admin/social/topics/${id}`, { body })
  )

  server.registerTool(
    'admin_list_topic_replies',
    {
      title: '[Admin] Listar respuestas de un topic',
      description: 'Lista las respuestas de un topic. Requiere ser owner.',
      inputSchema: {
        topic_id: z.string().describe('ID del topic'),
        q: z.string().optional().describe('Búsqueda por contenido o nombre de usuario'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    ({ topic_id: topicId, ...query }) =>
      call('GET', path`admin/social/topics/${topicId}/replies`, { query })
  )
}
