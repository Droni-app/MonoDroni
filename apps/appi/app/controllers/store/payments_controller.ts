import type { HttpContext } from '@adonisjs/core/http'
import StorePayment from '#models/store/payment'
import StoreOrder from '#models/store/order'
import { storePaymentValidator } from '#validators/store/payment'

export default class PaymentsController {
  /**
   * @index
   * @summary Listar mis pagos en el sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @responseBody 200 - {"meta": {"total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": []}
   * @responseBody 401 - {"message": "Unauthorized"}
   */
  async index({ site, auth, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    return StorePayment.query()
      .whereHas('order', (q) => q.where('site_id', site.id).where('user_id', auth.user!.id))
      .preload('order')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @store
   * @summary Registrar un pago para un pedido propio
   * @requestBody {"order_id": "uuid", "payment_method": "credit_card", "amount": 99.99, "currency": "COP", "transaction_id": "txn_abc123"}
   * @responseBody 201 - {"id": "uuid", "paymentStatus": "pending", "amount": 0}
   * @responseBody 400 - {"message": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async store({ site, auth, request, response }: HttpContext) {
    const data = await request.validateUsing(storePaymentValidator)

    // Verify the order belongs to the authenticated user
    const order = await StoreOrder.query()
      .where('site_id', site.id)
      .where('user_id', auth.user!.id)
      .where('id', data.order_id)
      .firstOrFail()

    const payment = await StorePayment.create({
      orderId: order.id,
      paymentMethod: data.payment_method,
      paymentStatus: 'pending',
      amount: String(data.amount),
      currency: data.currency ?? 'USD',
      transactionId: data.transaction_id ?? null,
    })

    return response.created(payment)
  }

  /**
   * @show
   * @summary Obtener un pago propio con su pedido
   * @paramPath id - ID del pago - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "paymentStatus": "pending", "amount": 0, "order": {}}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async show({ site, auth, params }: HttpContext) {
    return StorePayment.query()
      .whereHas('order', (q) => q.where('site_id', site.id).where('user_id', auth.user!.id))
      .where('id', params.id)
      .preload('order')
      .firstOrFail()
  }
}
