import type { HttpContext } from '@adonisjs/core/http'
import StoreProduct from '#models/store/product'

export default class ProductsController {
  /**
   * @index
   * @summary Listar productos activos del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery q - Búsqueda por nombre o descripción - @type(string)
   * @paramQuery tags - Filtrar por tag - @type(string)
   * @responseBody 200 - {"meta": {"total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": []}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const q = request.input('q')
    const tags = request.input('tags')

    const query = StoreProduct.query()
      .where('site_id', site.id)
      .where('active', true)
      .orderBy('created_at', 'desc')
      .preload('attributes')

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
   * @summary Obtener un producto por slug
   * @paramPath id - Slug del producto - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "slug": "string", "name": "string", "price": 0, "stock": 0, "active": true}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async show({ site, params }: HttpContext) {
    return StoreProduct.query()
      .where('site_id', site.id)
      .where('active', true)
      .where('slug', params.id)
      .preload('attributes')
      .firstOrFail()
  }
}
