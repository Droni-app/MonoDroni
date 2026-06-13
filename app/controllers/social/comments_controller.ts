import type { HttpContext } from '@adonisjs/core/http'
import SocialComment from '#models/social/comment'
import {
  indexCommentValidator,
  storeCommentValidator,
  updateCommentValidator,
} from '#validators/social/comment'
import { resolveCommentable } from '#services/commentable_registry'
import { DateTime } from 'luxon'

const EDIT_WINDOW_MINUTES = 5

export default class CommentsController {
  /**
   * @index
   * @summary Listar comentarios de un recurso
   * @paramQuery commentable_type - Tipo de recurso comentable (ej: ContentPost) - @type(string) @required
   * @paramQuery commentable_id - UUID del recurso comentado - @type(string) @required
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @responseBody 200 - {"meta": {"total": 5, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": [{"id": "uuid", "content": "string", "isEdited": false, "active": true, "createdAt": "string", "user": {"id": "uuid", "fullName": "string", "avatar": "string|null"}}]}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async index({ site, request }: HttpContext) {
    const data = await request.validateUsing(indexCommentValidator)
    const page = data.page ?? 1
    const perPage = data.per_page ?? 10

    return SocialComment.query()
      .where('site_id', site.id)
      .andWhere('active', true)
      .andWhere('commentable_type', data.commentable_type)
      .andWhere('commentable_id', data.commentable_id)
      .andWhereNull('parent_id')
      .preload('user')
      .orderBy('created_at', 'asc')
      .paginate(page, perPage)
  }

  /**
   * @show
   * @summary Obtener un comentario con sus respuestas
   * @paramPath id - ID del comentario - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "content": "string", "isEdited": false, "createdAt": "string", "user": {"id": "uuid", "fullName": "string", "avatar": "string"}, "parent": {"id": "uuid", "content": "string", "user": {"id": "uuid", "fullName": "string"}}, "children": [{"id": "uuid", "content": "string", "user": {"id": "uuid", "fullName": "string"}}]}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async show({ site, params }: HttpContext) {
    return SocialComment.query()
      .where('site_id', site.id)
      .andWhere('active', true)
      .andWhere('id', params.id)
      .preload('user')
      .preload('parent', (q) => q.preload('user'))
      .preload('children', (q) =>
        q.where('active', true).preload('user').orderBy('created_at', 'asc')
      )
      .firstOrFail()
  }

  /**
   * @store
   * @summary Crear un comentario
   * @requestBody {"commentable_type": "ContentPost", "commentable_id": "uuid", "content": "Mi comentario", "parent_id": "uuid|null"}
   * @responseBody 201 - {"id": "uuid", "commentableType": "ContentPost", "commentableId": "uuid", "content": "string", "parentId": "uuid|null", "isEdited": false, "createdAt": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async store({ site, auth, request }: HttpContext) {
    const data = await request.validateUsing(storeCommentValidator)
    const commentable = await resolveCommentable(
      data.commentable_type,
      data.commentable_id,
      site.id
    )
    const comment = await SocialComment.create({
      siteId: site.id,
      userId: auth.user!.id,
      commentableType: commentable.constructor.name,
      commentableId: commentable.id,
      parentId: data.parent_id ?? null,
      content: data.content,
    })
    return comment
  }

  /**
   * @update
   * @summary Editar un comentario propio (ventana de 5 minutos)
   * @paramPath id - ID del comentario - @type(string) @required
   * @requestBody {"content": "Comentario editado"}
   * @responseBody 200 - {"id": "uuid", "content": "string", "isEdited": true, "updatedAt": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Solo puedes editar un comentario dentro de los primeros 5 minutos"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async update({ site, auth, params, request, response }: HttpContext) {
    const comment = await SocialComment.query()
      .where('site_id', site.id)
      .andWhere('user_id', auth.user!.id)
      .andWhere('id', params.id)
      .firstOrFail()

    const editDeadline = comment.createdAt!.plus({ minutes: EDIT_WINDOW_MINUTES })
    if (DateTime.now() > editDeadline) {
      return response.forbidden({
        message: `Solo puedes editar un comentario dentro de los primeros ${EDIT_WINDOW_MINUTES} minutos`,
      })
    }

    const data = await request.validateUsing(updateCommentValidator)
    comment.content = data.content
    comment.isEdited = true
    await comment.save()
    return comment
  }
}
