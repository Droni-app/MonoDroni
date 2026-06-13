import type { HttpContext } from '@adonisjs/core/http'
import SocialComment from '#models/social/comment'
import { updateCommentValidator } from '#validators/admin/social/comment'

export default class CommentsController {
  /**
   * @index
   * @summary [Admin] Listar comentarios del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery q - Búsqueda por contenido - @type(string)
   * @paramQuery commentable_type - Filtrar por tipo de recurso - @type(string)
   * @paramQuery commentable_id - Filtrar por ID del recurso - @type(string)
   * @responseBody 200 - {"meta": {"total": 15, "perPage": 10, "currentPage": 1, "lastPage": 2}, "data": [{"id": "uuid", "content": "string", "commentableType": "ContentPost", "commentableId": "uuid", "isEdited": false, "active": true, "createdAt": "string", "user": {"id": "uuid", "fullName": "string", "avatar": "string|null"}}]}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const q = request.input('q', '')
    const commentableType = request.input('commentable_type')
    const commentableId = request.input('commentable_id')

    const query = SocialComment.query()
      .where('site_id', site.id)
      .preload('user')
      .orderBy('created_at', 'desc')

    if (q) query.where('content', 'like', `%${q}%`)
    if (commentableType) query.where('commentable_type', commentableType)
    if (commentableId) query.where('commentable_id', commentableId)

    return query.paginate(page, perPage)
  }

  /**
   * @show
   * @summary [Admin] Obtener un comentario con hilo completo
   * @paramPath id - ID del comentario - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "content": "string", "active": true, "isEdited": false, "createdAt": "string", "user": {"id": "uuid", "fullName": "string"}, "parent": {"id": "uuid", "content": "string", "user": {"id": "uuid", "fullName": "string"}}, "children": [{"id": "uuid", "content": "string", "user": {"id": "uuid", "fullName": "string"}}]}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async show({ site, params }: HttpContext) {
    return SocialComment.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .preload('user')
      .preload('parent', (q) => q.preload('user'))
      .preload('children', (q) => q.preload('user').orderBy('created_at', 'asc'))
      .firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Actualizar un comentario
   * @paramPath id - ID del comentario - @type(string) @required
   * @requestBody {"content": "Nuevo contenido del comentario", "active": true}
   * @responseBody 200 - {"id": "uuid", "content": "string", "active": true, "isEdited": true, "updatedAt": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async update({ site, params, request }: HttpContext) {
    const data = await request.validateUsing(updateCommentValidator)
    const comment = await SocialComment.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    comment.merge(data)
    await comment.save()
    return comment
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar un comentario
   * @paramPath id - ID del comentario - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "content": "string", "active": true}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async destroy({ site, params }: HttpContext) {
    const comment = await SocialComment.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    await comment.delete()
    return comment
  }
}
