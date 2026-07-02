import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store/order'
import StoreOrderItem from '#models/store/order_item'
import StoreProduct from '#models/store/product'
import StoreCoupon from '#models/store/coupon'
import { storeOrderValidator } from '#validators/store/order'
import { DateTime } from 'luxon'

export default class OrdersController {
  /**
   * @index
   * @summary Listar mis pedidos en el sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @responseBody 200 - {"meta": {"total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": []}
   * @responseBody 401 - {"message": "Unauthorized"}
   */
  async index({ site, auth, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    return StoreOrder.query()
      .where('site_id', site.id)
      .where('user_id', auth.user!.id)
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @store
   * @summary Crear un nuevo pedido
   * @requestBody {"items": [{"product_id": "uuid", "quantity": 1}], "shipping_address": {}, "coupon_code": "DESCUENTO10"}
   * @responseBody 201 - {"id": "uuid", "status": "pending", "total": 0}
   * @responseBody 400 - {"message": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async store({ site, auth, request, response }: HttpContext) {
    const data = await request.validateUsing(storeOrderValidator)

    // Load and validate products
    const productIds = data.items.map((i) => i.product_id)
    const products = await StoreProduct.query()
      .where('site_id', site.id)
      .where('active', true)
      .whereIn('id', productIds)

    if (products.length !== productIds.length) {
      return response.badRequest({ message: 'Uno o más productos no existen o no están disponibles.' })
    }

    const productMap = new Map(products.map((p) => [p.id, p]))

    // Calculate subtotal from real prices
    let subtotal = 0
    for (const item of data.items) {
      const product = productMap.get(item.product_id)!
      subtotal += Number(product.price) * item.quantity
    }

    // Apply coupon if provided
    let discount = 0
    if (data.coupon_code) {
      const coupon = await StoreCoupon.query()
        .where('site_id', site.id)
        .where('code', data.coupon_code.toUpperCase())
        .where('active', true)
        .first()

      if (!coupon) {
        return response.badRequest({ message: 'El cupón no es válido o está inactivo.' })
      }
      if (coupon.expirationDate && DateTime.now() > coupon.expirationDate) {
        return response.badRequest({ message: 'El cupón ha expirado.' })
      }
      if (coupon.minimumOrderValue && subtotal < Number(coupon.minimumOrderValue)) {
        return response.badRequest({
          message: `El pedido mínimo para este cupón es $${coupon.minimumOrderValue}.`,
        })
      }

      discount =
        coupon.discountType === 'percentage'
          ? subtotal * (Number(coupon.discount) / 100)
          : Number(coupon.discount)
    }

    const total = Math.max(0, subtotal - discount)

    // Create order
    const order = await StoreOrder.create({
      siteId: site.id,
      userId: auth.user!.id,
      status: 'pending',
      total,
      shippingAddress: data.shipping_address ?? null,
      billingAddress: data.billing_address ?? null,
    })

    // Create order items
    for (const item of data.items) {
      const product = productMap.get(item.product_id)!
      await StoreOrderItem.create({
        orderId: order.id,
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      })
    }

    await order.load('items')
    return response.created(order)
  }

  /**
   * @show
   * @summary Obtener un pedido propio con sus items y pago
   * @paramPath id - ID del pedido - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "status": "pending", "total": 0, "items": [], "payments": []}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async show({ site, auth, params }: HttpContext) {
    return StoreOrder.query()
      .where('site_id', site.id)
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('items', (q) => q.preload('product'))
      .preload('payments')
      .firstOrFail()
  }
}
