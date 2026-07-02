import type { HttpContext } from '@adonisjs/core/http'
import StorePayment from '#models/store/payment'
import { updatePaymentValidator } from '#validators/admin/store/payment'

export default class PaymentsController {
  /**
   * @index
   * @summary [Admin] Listar pagos del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery status - Filtrar por estado - @type(string)
   * @responseBody 200 - {"meta": {"total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": []}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const status = request.input('status', '')
    return StorePayment.query()
      .whereHas('order', (q) => q.where('site_id', site.id))
      .if(status, (query) => query.where('payment_status', status))
      .preload('order')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @show
   * @summary [Admin] Obtener un pago con su pedido asociado
   * @paramPath id - ID del pago - @type(string) @required
   */
  async show({ site, params }: HttpContext) {
    return StorePayment.query()
      .whereHas('order', (q) => q.where('site_id', site.id))
      .where('id', params.id)
      .preload('order', (q) => q.preload('items', (qi) => qi.preload('product')))
      .firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Actualizar el estado de un pago
   * @paramPath id - ID del pago - @type(string) @required
   * @requestBody {"payment_status": "completed"}
   */
  async update({ site, params, request }: HttpContext) {
    const data = await request.validateUsing(updatePaymentValidator)
    const payment = await StorePayment.query()
      .whereHas('order', (q) => q.where('site_id', site.id))
      .where('id', params.id)
      .firstOrFail()
    payment.merge({ paymentStatus: data.payment_status })
    await payment.save()
    return payment
  }
}
