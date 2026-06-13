import type { HttpContext } from '@adonisjs/core/http'
import ContentPost from '#models/content/post'
import ContentAttribute from '#models/content/attribute'
import { storePostAttributeValidator } from '#validators/admin/content/post_attribute'

export default class PostAttributesController {
  /**
   * @index
   * @summary [Admin] Listar atributos de un post
   * @paramPath post_id - ID del post - @type(string) @required
   * @responseBody 200 - [{"id": "uuid", "contentPostId": "uuid", "name": "string", "value": "string"}]
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async index({ site, params }: HttpContext) {
    const post = await ContentPost.query()
      .where('site_id', site.id)
      .where('id', params.post_id)
      .firstOrFail()
    const attributes = await ContentAttribute.query().where('content_post_id', post.id)
    return attributes
  }

  /**
   * @store
   * @summary [Admin] Agregar atributo a un post
   * @paramPath post_id - ID del post - @type(string) @required
   * @requestBody {"name": "color", "value": "#ff0000"}
   * @responseBody 201 - {"id": "uuid", "contentPostId": "uuid", "name": "string", "value": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async store({ site, params, request }: HttpContext) {
    const post = await ContentPost.query()
      .where('site_id', site.id)
      .where('id', params.post_id)
      .firstOrFail()
    const data = await request.validateUsing(storePostAttributeValidator)
    const attribute = await ContentAttribute.create({ ...data, contentPostId: post.id })
    return attribute
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar atributo de un post
   * @paramPath post_id - ID del post - @type(string) @required
   * @paramPath id - ID del atributo - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "name": "string", "value": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async destroy({ site, params }: HttpContext) {
    const post = await ContentPost.query()
      .where('site_id', site.id)
      .where('id', params.post_id)
      .firstOrFail()
    const attribute = await ContentAttribute.query()
      .where('content_post_id', post.id)
      .where('id', params.id)
      .firstOrFail()
    await attribute.delete()
    return attribute
  }
}
