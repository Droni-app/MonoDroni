import type { HttpContext } from '@adonisjs/core/http'
import SocialTopic from '#models/social/topic'
import { updateTopicValidator } from '#validators/admin/social/topic'

export default class TopicsController {
  /**
   * @index
   * @summary [Admin] Listar topics del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery q - Búsqueda por nombre o contenido - @type(string)
   * @responseBody 200 - {"meta": {"total": 10, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": [{"id": "uuid", "slug": "string", "name": "string", "content": "string", "active": true, "updatedAt": "string", "user": {"id": "uuid", "fullName": "string", "avatar": "string|null"}}]}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const q = request.input('q', '')

    const query = SocialTopic.query()
      .where('site_id', site.id)
      .preload('user')
      .orderBy('updated_at', 'desc')

    if (q) {
      query.where((sub) => sub.whereILike('name', `%${q}%`).orWhereILike('content', `%${q}%`))
    }

    return query.paginate(page, perPage)
  }

  /**
   * @show
   * @summary [Admin] Obtener un topic por ID
   * @paramPath id - ID del topic - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "slug": "string", "name": "string", "content": "string", "active": true, "createdAt": "string", "updatedAt": "string", "user": {"id": "uuid", "fullName": "string", "avatar": "string|null"}}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async show({ site, params }: HttpContext) {
    return SocialTopic.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .preload('user')
      .firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Actualizar un topic
   * @paramPath id - ID del topic - @type(string) @required
   * @requestBody {"name": "Nuevo nombre", "content": "Nuevo contenido", "active": true}
   * @responseBody 200 - {"id": "uuid", "slug": "string", "name": "string", "content": "string", "active": true, "updatedAt": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async update({ site, params, request }: HttpContext) {
    const topic = await SocialTopic.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()

    const data = await request.validateUsing(updateTopicValidator)
    topic.merge(data)
    await topic.save()
    return topic
  }
}
