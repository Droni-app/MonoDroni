import type { HttpContext } from '@adonisjs/core/http'
import SocialTopic from '#models/social/topic'
import SocialReply from '#models/social/reply'
import { storeReplyValidator } from '#validators/social/reply'

export default class RepliesController {
  /**
   * @store
   * @summary Responder a un topic (requiere enrollment activo)
   * @paramPath topic_id - Slug del topic - @type(string) @required
   * @requestBody {"content": "Mi respuesta al topic"}
   * @responseBody 201 - {"id": "uuid", "topicId": "uuid", "userId": "uuid", "content": "string", "createdAt": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 404 - {"message": "Not Found"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async store({ site, auth, params, request }: HttpContext) {
    const topic = await SocialTopic.query()
      .where('site_id', site.id)
      .andWhere('slug', params.topic_id)
      .firstOrFail()

    const data = await request.validateUsing(storeReplyValidator)

    return SocialReply.create({
      topicId: topic.id,
      userId: auth.user!.id,
      content: data.content,
    })
  }
}
