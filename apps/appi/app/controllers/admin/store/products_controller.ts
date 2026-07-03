import type { HttpContext } from '@adonisjs/core/http'
import StoreProduct from '#models/store/product'
import { storeProductValidator, updateProductValidator } from '#validators/admin/store/product'
import string from '@adonisjs/core/helpers/string'

export default class ProductsController {
  /**
   * @index
   * @summary [Admin] Listar productos del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery q - Búsqueda por nombre o descripción - @type(string)
   * @responseBody 200 - {"meta": {"total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": []}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const q = request.input('q', '')
    return StoreProduct.query()
      .where('site_id', site.id)
      .if(q, (query) => {
        query.where('name', 'like', `%${q}%`).orWhere('description', 'like', `%${q}%`)
      })
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @store
   * @summary [Admin] Crear un nuevo producto
   */
  async store({ site, request, response }: HttpContext) {
    const data = await request.validateUsing(storeProductValidator)
    const slugBase = string.slug(data.name)
    const existing = await StoreProduct.query()
      .where('site_id', site.id)
      .where('slug', slugBase)
      .first()
    const slug = existing ? `${slugBase}-${string.generateRandom(6)}` : slugBase
    const product = await StoreProduct.create({
      ...data,
      slug,
      siteId: site.id,
      price: String(data.price),
      sizeW: data.size_w !== null && data.size_w !== undefined ? String(data.size_w) : null,
      sizeH: data.size_h !== null && data.size_h !== undefined ? String(data.size_h) : null,
      sizeD: data.size_d !== null && data.size_d !== undefined ? String(data.size_d) : null,
      weight: data.weight !== null && data.weight !== undefined ? String(data.weight) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    })
    return response.created(product)
  }

  /**
   * @show
   * @summary [Admin] Obtener un producto por ID
   * @paramPath id - ID del producto - @type(string) @required
   */
  async show({ site, params }: HttpContext) {
    return StoreProduct.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .preload('attributes')
      .firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Actualizar un producto
   * @paramPath id - ID del producto - @type(string) @required
   */
  async update({ site, params, request }: HttpContext) {
    const data = await request.validateUsing(updateProductValidator)
    const product = await StoreProduct.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    product.merge({
      ...data,
      price: data.price !== undefined ? String(data.price) : undefined,
      sizeW:
        data.size_w !== undefined ? (data.size_w !== null ? String(data.size_w) : null) : undefined,
      sizeH:
        data.size_h !== undefined ? (data.size_h !== null ? String(data.size_h) : null) : undefined,
      sizeD:
        data.size_d !== undefined ? (data.size_d !== null ? String(data.size_d) : null) : undefined,
      weight:
        data.weight !== undefined ? (data.weight !== null ? String(data.weight) : null) : undefined,
      tags: data.tags !== undefined ? (data.tags ? JSON.stringify(data.tags) : null) : undefined,
    })
    await product.save()
    return product
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar un producto
   * @paramPath id - ID del producto - @type(string) @required
   */
  async destroy({ site, params }: HttpContext) {
    const product = await StoreProduct.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    await product.delete()
    return product
  }
}
