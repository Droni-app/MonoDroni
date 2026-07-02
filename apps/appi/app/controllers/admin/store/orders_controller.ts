import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store/order'
import { updateOrderValidator } from '#validators/admin/store/order'

export default class OrdersController {
  /**
   * @index
   * @summary [Admin] Listar pedidos del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery status - Filtrar por estado - @type(string)
   * @responseBody 200 - {"meta": {"total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": []}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const status = request.input('status', '')
    return StoreOrder.query()
      .where('site_id', site.id)
      .if(status, (query) => query.where('status', status))
      .preload('user')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @show
   * @summary [Admin] Obtener un pedido con sus items y pago
   * @paramPath id - ID del pedido - @type(string) @required
   */
  async show({ site, params }: HttpContext) {
    return StoreOrder.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .preload('user')
      .preload('items', (q) => q.preload('product'))
      .preload('payment')
      .firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Actualizar el estado de un pedido
   * @paramPath id - ID del pedido - @type(string) @required
   * @requestBody {"status": "shipped"}
   */
  async update({ site, params, request }: HttpContext) {
    const data = await request.validateUsing(updateOrderValidator)
    const order = await StoreOrder.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    order.merge(data)
    await order.save()
    return order
  }
}
