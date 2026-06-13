import type { HttpContext } from '@adonisjs/core/http'
import SocialTopic from '#models/social/topic'
import SocialReply from '#models/social/reply'
import { storeTopicValidator } from '#validators/social/topic'
import string from '@adonisjs/core/helpers/string'

export default class TopicsController {
  /**
   * @index
   * @summary Listar topics activos
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery group - Filtrar por grupo - @type(string)
   * @paramQuery q - Búsqueda por nombre o contenido - @type(string)
   * @responseBody 200 - {"meta": {"total": 15, "perPage": 10, "currentPage": 1, "lastPage": 2}, "data": [{"id": "uuid", "name": "string", "slug": "string", "group": "string|null", "content": "string", "active": true, "createdAt": "string", "user": {"id": "uuid", "fullName": "string", "avatar": "string|null"}}]}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const group = request.input('group')
    const q = request.input('q')

    return SocialTopic.query()
      .where('site_id', site.id)
      .andWhere('active', true)
      .if(group, (query) => query.andWhere('group', group))
      .if(q, (query) =>
        query.andWhere((sub) => sub.whereILike('name', `%${q}%`).orWhereILike('content', `%${q}%`))
      )
      .preload('user')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @show
   * @summary Obtener un topic por slug con sus replies paginados
   * @paramPath id - Slug del topic - @type(string) @required
   * @paramQuery page - Página de replies - @type(number)
   * @paramQuery per_page - Replies por página (default 10) - @type(number)
   * @responseBody 200 - {"topic": {"id": "uuid", "name": "string", "slug": "string", "group": "string|null", "content": "string", "user": {"id": "uuid", "fullName": "string", "avatar": "string|null"}}, "replies": {"meta": {"total": 3, "perPage": 10, "currentPage": 1}, "data": [{"id": "uuid", "content": "string", "createdAt": "string", "user": {"id": "uuid", "fullName": "string"}}]}}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async show({ site, params, request }: HttpContext) {
    const topic = await SocialTopic.query()
      .where('site_id', site.id)
      .andWhere('active', true)
      .andWhere('slug', params.id)
      .preload('user')
      .firstOrFail()

    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)

    const replies = await SocialReply.query()
      .where('topic_id', topic.id)
      .preload('user')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)

    return { topic, replies }
  }

  /**
   * @store
   * @summary Crear un topic (requiere enrollment activo)
   * @requestBody {"name": "Título del topic", "content": "Descripción completa", "group": "preguntas"}
   * @responseBody 201 - {"id": "uuid", "name": "string", "slug": "string", "group": "string|null", "content": "string", "active": false, "createdAt": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async store({ site, auth, request }: HttpContext) {
    const data = await request.validateUsing(storeTopicValidator)
    const slugBase = string.slug(data.name)
    const existingTopic = await SocialTopic.query()
      .where('site_id', site.id)
      .andWhere('slug', slugBase)
      .first()
    const slug = existingTopic ? `${slugBase}-${string.generateRandom(6)}` : slugBase

    return SocialTopic.create({
      siteId: site.id,
      userId: auth.user!.id,
      name: data.name,
      slug,
      content: data.content,
      group: data.group,
    })
  }
}
