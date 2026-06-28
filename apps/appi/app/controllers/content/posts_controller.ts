import type { HttpContext } from '@adonisjs/core/http'
import ContentPost from '#models/content/post'

export default class PostsController {
  /**
   * @index
   * @summary Listar posts publicados
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery q - Búsqueda por nombre o descripción - @type(string)
   * @paramQuery tags - Filtrar por etiqueta - @type(string)
   * @responseBody 200 - {"meta": {"total": 15, "perPage": 10, "currentPage": 1, "lastPage": 2}, "data": [{"id": "uuid", "slug": "string", "name": "string", "description": "string", "tags": ["string"], "picture": "string|null", "content": "string", "format": "markdown", "active": true, "createdAt": "string", "user": {"id": "uuid", "fullName": "string", "avatar": "string|null"}, "attributes": [{"id": "uuid", "name": "string", "value": "string"}]}]}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const q = request.input('q')
    const tags = request.input('tags')

    const query = ContentPost.query()
      .where('site_id', site.id)
      .where('active', true)
      .whereRaw(`JSON_SEARCH(tags, 'one', 'Archivo') IS NULL`)
      .orderBy('created_at', 'desc')
      .preload('attributes')
      .preload('user')

    if (q) {
      query.where((builder) => {
        builder.whereLike('name', `%${q}%`).orWhereLike('description', `%${q}%`)
      })
    }

    if (tags) {
      const tagList: string[] = Array.isArray(tags) ? tags : [tags]
      tagList.forEach((tag) => query.whereRaw(`JSON_SEARCH(tags, 'one', ?) IS NOT NULL`, [tag]))
    }

    return query.paginate(page, perPage)
  }

  /**
   * @show
   * @summary Obtener un post por slug
   * @paramPath id - Slug del post - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "slug": "string", "name": "string", "description": "string", "tags": ["string"], "picture": "string|null", "content": "string", "format": "markdown", "active": true, "createdAt": "string", "user": {"id": "uuid", "fullName": "string", "avatar": "string|null"}, "attributes": [{"id": "uuid", "name": "string", "value": "string"}]}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async show({ site, params }: HttpContext) {
    return ContentPost.query()
      .where('site_id', site.id)
      .andWhere('active', true)
      .andWhere('slug', params.id)
      .preload('attributes')
      .preload('user')
      .firstOrFail()
  }
}
