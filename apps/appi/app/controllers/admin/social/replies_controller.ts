import type { HttpContext } from '@adonisjs/core/http'
import SocialTopic from '#models/social/topic'
import SocialReply from '#models/social/reply'

export default class RepliesController {
  /**
   * @index
   * @summary [Admin] Listar respuestas de un topic
   * @paramPath topic_id - ID del topic - @type(string) @required
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 20) - @type(number)
   * @paramQuery q - Búsqueda por contenido o nombre de usuario - @type(string)
   * @responseBody 200 - {"meta": {"total": 20, "perPage": 20, "currentPage": 1, "lastPage": 1}, "data": [{"id": "uuid", "topicId": "uuid", "content": "string", "createdAt": "string", "user": {"id": "uuid", "fullName": "string", "avatar": "string|null"}}]}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async index({ site, params, request }: HttpContext) {
    await SocialTopic.query().where('site_id', site.id).where('id', params.topic_id).firstOrFail()

    const page = request.input('page', 1)
    const perPage = request.input('per_page', 20)
    const q = request.input('q', '')

    const query = SocialReply.query()
      .where('topic_id', params.topic_id)
      .preload('user')
      .orderBy('created_at', 'asc')

    if (q) {
      query.where((sub) =>
        sub
          .whereILike('content', `%${q}%`)
          .orWhereHas('user', (userQ) => userQ.whereILike('full_name', `%${q}%`))
      )
    }

    return query.paginate(page, perPage)
  }
}
