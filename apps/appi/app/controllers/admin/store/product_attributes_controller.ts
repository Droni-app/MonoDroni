import type { HttpContext } from '@adonisjs/core/http'
import StoreProduct from '#models/store/product'
import StoreProductAttribute from '#models/store/product_attribute'
import { storeProductAttributeValidator } from '#validators/admin/store/product_attribute'

export default class ProductAttributesController {
  /**
   * @index
   * @summary [Admin] Listar atributos de un producto
   * @paramPath product_id - ID del producto - @type(string) @required
   * @responseBody 200 - [{"id": "uuid", "productId": "uuid", "name": "string", "value": "string"}]
   */
  async index({ site, params }: HttpContext) {
    const product = await StoreProduct.query()
      .where('site_id', site.id)
      .where('id', params.product_id)
      .firstOrFail()
    return StoreProductAttribute.query().where('product_id', product.id)
  }

  /**
   * @store
   * @summary [Admin] Agregar atributo a un producto
   * @paramPath product_id - ID del producto - @type(string) @required
   * @requestBody {"name": "Color", "value": "Rojo"}
   * @responseBody 201 - {"id": "uuid", "productId": "uuid", "name": "string", "value": "string"}
   */
  async store({ site, params, request, response }: HttpContext) {
    const product = await StoreProduct.query()
      .where('site_id', site.id)
      .where('id', params.product_id)
      .firstOrFail()
    const data = await request.validateUsing(storeProductAttributeValidator)
    const attribute = await StoreProductAttribute.create({ ...data, productId: product.id })
    return response.created(attribute)
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar atributo de un producto
   * @paramPath product_id - ID del producto - @type(string) @required
   * @paramPath id - ID del atributo - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "name": "string", "value": "string"}
   */
  async destroy({ site, params }: HttpContext) {
    const product = await StoreProduct.query()
      .where('site_id', site.id)
      .where('id', params.product_id)
      .firstOrFail()
    const attribute = await StoreProductAttribute.query()
      .where('product_id', product.id)
      .where('id', params.id)
      .firstOrFail()
    await attribute.delete()
    return attribute
  }
}
