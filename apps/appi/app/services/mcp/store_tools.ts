import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type { AppiCall } from '#services/mcp/appi_client'
import { pagination, path } from '#services/mcp/shared'

const addressFields = {
  address_line2: z.string().nullable().optional().describe('Complemento (apto, torre...)'),
  city_id: z.number().int().nullable().optional().describe('ID de la ciudad'),
  postal_code: z.string().nullable().optional().describe('Código postal'),
  phone: z.string().nullable().optional().describe('Teléfono de contacto'),
  comments: z.string().nullable().optional().describe('Indicaciones para la entrega'),
}

const addressSnapshot = z
  .record(z.string(), z.unknown())
  .optional()
  .describe(
    'Copia de la dirección que se guarda en el pedido (por ejemplo una de list_my_addresses)'
  )

/**
 * Customer-facing store tools: public catalog + the authenticated user's own
 * addresses, orders and payments (`store/*`).
 */
export function registerStoreTools(server: McpServer, call: AppiCall) {
  server.registerTool(
    'list_products',
    {
      title: 'Listar productos',
      description: 'Lista los productos activos del catálogo.',
      inputSchema: {
        q: z.string().optional().describe('Búsqueda por nombre o descripción'),
        tags: z
          .array(z.string())
          .optional()
          .describe('Solo productos que tengan todas estas etiquetas'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'store/products', { query: args })
  )

  server.registerTool(
    'get_product',
    {
      title: 'Ver producto',
      description: 'Obtiene un producto activo por su slug, con sus atributos.',
      inputSchema: { slug: z.string().describe('Slug del producto') },
      annotations: { readOnlyHint: true },
    },
    ({ slug }) => call('GET', path`store/products/${slug}`)
  )

  server.registerTool(
    'list_my_addresses',
    {
      title: 'Listar mis direcciones',
      description: 'Lista las direcciones del usuario autenticado en este sitio.',
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    () => call('GET', 'store/addresses')
  )

  server.registerTool(
    'get_my_address',
    {
      title: 'Ver mi dirección',
      description: 'Obtiene una dirección propia.',
      inputSchema: { id: z.string().describe('ID de la dirección') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`store/addresses/${id}`)
  )

  server.registerTool(
    'create_address',
    {
      title: 'Crear dirección',
      description: 'Guarda una nueva dirección para el usuario autenticado.',
      inputSchema: { address_line1: z.string().describe('Dirección principal'), ...addressFields },
    },
    (body) => call('POST', 'store/addresses', { body })
  )

  server.registerTool(
    'update_address',
    {
      title: 'Actualizar dirección',
      description: 'Actualiza solo los campos enviados de una dirección propia.',
      inputSchema: {
        id: z.string().describe('ID de la dirección'),
        address_line1: z.string().optional().describe('Dirección principal'),
        ...addressFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...body }) => call('PUT', path`store/addresses/${id}`, { body })
  )

  server.registerTool(
    'delete_address',
    {
      title: 'Eliminar dirección',
      description: 'Elimina una dirección propia.',
      inputSchema: { id: z.string().describe('ID de la dirección') },
      annotations: { destructiveHint: true },
    },
    ({ id }) => call('DELETE', path`store/addresses/${id}`)
  )

  server.registerTool(
    'list_my_orders',
    {
      title: 'Listar mis pedidos',
      description: 'Lista los pedidos del usuario autenticado.',
      inputSchema: { ...pagination },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'store/orders', { query: args })
  )

  server.registerTool(
    'get_my_order',
    {
      title: 'Ver mi pedido',
      description: 'Obtiene un pedido propio con sus items y pago.',
      inputSchema: { id: z.string().describe('ID del pedido') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`store/orders/${id}`)
  )

  server.registerTool(
    'create_order',
    {
      title: 'Crear pedido',
      description:
        'Crea un pedido en estado pending. Precios, stock y cupón se validan en el servidor. Confirma con el usuario antes de llamarla.',
      inputSchema: {
        items: z
          .array(
            z.object({
              product_id: z.string().describe('ID del producto'),
              quantity: z.number().int().min(1).describe('Cantidad'),
            })
          )
          .min(1)
          .describe('Productos del pedido'),
        shipping_address: addressSnapshot,
        billing_address: addressSnapshot,
        coupon_code: z.string().nullable().optional().describe('Código de cupón de descuento'),
      },
    },
    (body) => call('POST', 'store/orders', { body })
  )

  server.registerTool(
    'list_my_payments',
    {
      title: 'Listar mis pagos',
      description: 'Lista los pagos del usuario autenticado.',
      inputSchema: { ...pagination },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'store/payments', { query: args })
  )

  server.registerTool(
    'get_my_payment',
    {
      title: 'Ver mi pago',
      description: 'Obtiene un pago propio con su pedido.',
      inputSchema: { id: z.string().describe('ID del pago') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`store/payments/${id}`)
  )

  server.registerTool(
    'register_payment',
    {
      title: 'Registrar pago',
      description:
        'Registra el pago de un pedido propio (por ejemplo tras pagar en la pasarela). Confirma con el usuario antes de llamarla.',
      inputSchema: {
        order_id: z.string().describe('ID del pedido'),
        payment_method: z.string().describe('Medio de pago (ej: credit_card)'),
        amount: z.number().min(0).describe('Monto pagado'),
        currency: z.string().optional().describe('Moneda (ej: COP)'),
        transaction_id: z
          .string()
          .nullable()
          .optional()
          .describe('ID de la transacción en la pasarela'),
      },
    },
    (body) => call('POST', 'store/payments', { body })
  )
}

const productFields = {
  description: z.string().nullable().optional().describe('Resumen corto'),
  content: z.string().nullable().optional().describe('Descripción larga'),
  picture: z.string().nullable().optional().describe('URL de la imagen principal'),
  tags: z.array(z.string()).nullable().optional().describe('Etiquetas'),
  size_w: z.number().min(0).nullable().optional().describe('Ancho (cm)'),
  size_h: z.number().min(0).nullable().optional().describe('Alto (cm)'),
  size_d: z.number().min(0).nullable().optional().describe('Profundidad (cm)'),
  weight: z.number().min(0).nullable().optional().describe('Peso (kg)'),
  active: z.boolean().optional().describe('true = visible en el catálogo'),
}

const couponFields = {
  minimum_order_value: z
    .number()
    .min(0)
    .nullable()
    .optional()
    .describe('Subtotal mínimo del pedido'),
  expiration_date: z.string().nullable().optional().describe('Fecha de vencimiento (ISO 8601)'),
  active: z.boolean().optional().describe('true = se puede usar'),
}

const shippingRuleFields = {
  state_id: z.number().int().nullable().optional().describe('ID del departamento/estado'),
  city_id: z.number().int().nullable().optional().describe('ID de la ciudad'),
  price_per_kg: z.number().min(0).nullable().optional().describe('Recargo por kg'),
  price_per_cm3: z.number().min(0).nullable().optional().describe('Recargo por cm³'),
  active: z.boolean().optional().describe('true = regla activa'),
}

/**
 * Owner-only store tools (`admin/store/*`); the adminSite middleware on each
 * target route rejects anyone who isn't the site owner.
 */
export function registerStoreAdminTools(server: McpServer, call: AppiCall) {
  // Products

  server.registerTool(
    'admin_list_products',
    {
      title: '[Admin] Listar productos',
      description: 'Lista todos los productos, incluidos los inactivos.',
      inputSchema: {
        q: z.string().optional().describe('Búsqueda por nombre o descripción'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'admin/store/products', { query: args })
  )

  server.registerTool(
    'admin_get_product',
    {
      title: '[Admin] Ver producto',
      description: 'Obtiene un producto por ID.',
      inputSchema: { id: z.string().describe('ID del producto') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`admin/store/products/${id}`)
  )

  server.registerTool(
    'admin_create_product',
    {
      title: '[Admin] Crear producto',
      description: 'Crea un producto. El slug se genera a partir del nombre.',
      inputSchema: {
        name: z.string().describe('Nombre'),
        price: z.number().min(0).describe('Precio'),
        stock: z.number().int().min(0).describe('Unidades disponibles'),
        ...productFields,
      },
    },
    (body) => call('POST', 'admin/store/products', { body })
  )

  server.registerTool(
    'admin_update_product',
    {
      title: '[Admin] Actualizar producto',
      description: 'Actualiza solo los campos enviados de un producto.',
      inputSchema: {
        id: z.string().describe('ID del producto'),
        name: z.string().optional().describe('Nombre'),
        price: z.number().min(0).optional().describe('Precio'),
        stock: z.number().int().min(0).optional().describe('Unidades disponibles'),
        ...productFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...body }) => call('PUT', path`admin/store/products/${id}`, { body })
  )

  server.registerTool(
    'admin_delete_product',
    {
      title: '[Admin] Eliminar producto',
      description: 'Elimina un producto definitivamente.',
      inputSchema: { id: z.string().describe('ID del producto') },
      annotations: { destructiveHint: true },
    },
    ({ id }) => call('DELETE', path`admin/store/products/${id}`)
  )

  server.registerTool(
    'admin_list_product_attributes',
    {
      title: '[Admin] Listar atributos de un producto',
      description: 'Lista los atributos (ej: Color, Talla) de un producto.',
      inputSchema: { product_id: z.string().describe('ID del producto') },
      annotations: { readOnlyHint: true },
    },
    ({ product_id: productId }) => call('GET', path`admin/store/products/${productId}/attributes`)
  )

  server.registerTool(
    'admin_add_product_attribute',
    {
      title: '[Admin] Agregar atributo a un producto',
      description: 'Agrega un atributo nombre-valor a un producto.',
      inputSchema: {
        product_id: z.string().describe('ID del producto'),
        name: z.string().describe('Nombre del atributo (ej: Color)'),
        value: z.string().describe('Valor (ej: Rojo)'),
      },
    },
    ({ product_id: productId, ...body }) =>
      call('POST', path`admin/store/products/${productId}/attributes`, { body })
  )

  server.registerTool(
    'admin_delete_product_attribute',
    {
      title: '[Admin] Eliminar atributo de un producto',
      description: 'Elimina un atributo de un producto.',
      inputSchema: {
        product_id: z.string().describe('ID del producto'),
        id: z.string().describe('ID del atributo'),
      },
      annotations: { destructiveHint: true },
    },
    ({ product_id: productId, id }) =>
      call('DELETE', path`admin/store/products/${productId}/attributes/${id}`)
  )

  // Orders & payments

  server.registerTool(
    'admin_list_orders',
    {
      title: '[Admin] Listar pedidos',
      description: 'Lista los pedidos del sitio.',
      inputSchema: {
        status: z
          .enum(['pending', 'paid', 'shipped', 'completed', 'canceled'])
          .optional()
          .describe('Filtrar por estado'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'admin/store/orders', { query: args })
  )

  server.registerTool(
    'admin_get_order',
    {
      title: '[Admin] Ver pedido',
      description: 'Obtiene un pedido con sus items y pago.',
      inputSchema: { id: z.string().describe('ID del pedido') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`admin/store/orders/${id}`)
  )

  server.registerTool(
    'admin_update_order_status',
    {
      title: '[Admin] Cambiar estado de pedido',
      description: 'Cambia el estado de un pedido (por ejemplo a shipped cuando se despacha).',
      inputSchema: {
        id: z.string().describe('ID del pedido'),
        status: z
          .enum(['pending', 'paid', 'shipped', 'completed', 'canceled'])
          .describe('Nuevo estado'),
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...body }) => call('PUT', path`admin/store/orders/${id}`, { body })
  )

  server.registerTool(
    'admin_list_payments',
    {
      title: '[Admin] Listar pagos',
      description: 'Lista los pagos del sitio.',
      inputSchema: {
        status: z
          .enum(['pending', 'completed', 'failed'])
          .optional()
          .describe('Filtrar por estado'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'admin/store/payments', { query: args })
  )

  server.registerTool(
    'admin_get_payment',
    {
      title: '[Admin] Ver pago',
      description: 'Obtiene un pago con su pedido asociado.',
      inputSchema: { id: z.string().describe('ID del pago') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`admin/store/payments/${id}`)
  )

  server.registerTool(
    'admin_update_payment_status',
    {
      title: '[Admin] Cambiar estado de pago',
      description: 'Cambia el estado de un pago.',
      inputSchema: {
        id: z.string().describe('ID del pago'),
        payment_status: z.enum(['pending', 'completed', 'failed']).describe('Nuevo estado'),
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...body }) => call('PUT', path`admin/store/payments/${id}`, { body })
  )

  // Coupons

  server.registerTool(
    'admin_list_coupons',
    {
      title: '[Admin] Listar cupones',
      description: 'Lista los cupones de descuento del sitio.',
      inputSchema: { ...pagination },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'admin/store/coupons', { query: args })
  )

  server.registerTool(
    'admin_get_coupon',
    {
      title: '[Admin] Ver cupón',
      description: 'Obtiene un cupón por ID.',
      inputSchema: { id: z.string().describe('ID del cupón') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`admin/store/coupons/${id}`)
  )

  server.registerTool(
    'admin_create_coupon',
    {
      title: '[Admin] Crear cupón',
      description: 'Crea un cupón de descuento. El código se guarda en mayúsculas.',
      inputSchema: {
        code: z.string().describe('Código que escribe el cliente'),
        discount: z.number().min(0).describe('Valor del descuento'),
        discount_type: z
          .enum(['percentage', 'fixed'])
          .describe('percentage = % del subtotal, fixed = monto fijo'),
        ...couponFields,
      },
    },
    (body) => call('POST', 'admin/store/coupons', { body })
  )

  server.registerTool(
    'admin_update_coupon',
    {
      title: '[Admin] Actualizar cupón',
      description: 'Actualiza solo los campos enviados de un cupón.',
      inputSchema: {
        id: z.string().describe('ID del cupón'),
        code: z.string().optional().describe('Código'),
        discount: z.number().min(0).optional().describe('Valor del descuento'),
        discount_type: z.enum(['percentage', 'fixed']).optional().describe('Tipo de descuento'),
        ...couponFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...body }) => call('PUT', path`admin/store/coupons/${id}`, { body })
  )

  server.registerTool(
    'admin_delete_coupon',
    {
      title: '[Admin] Eliminar cupón',
      description: 'Elimina un cupón.',
      inputSchema: { id: z.string().describe('ID del cupón') },
      annotations: { destructiveHint: true },
    },
    ({ id }) => call('DELETE', path`admin/store/coupons/${id}`)
  )

  // Shipping rules

  server.registerTool(
    'admin_list_shipping_rules',
    {
      title: '[Admin] Listar reglas de envío',
      description: 'Lista las reglas de costo de envío del sitio.',
      inputSchema: { ...pagination },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'admin/store/shipping-rules', { query: args })
  )

  server.registerTool(
    'admin_get_shipping_rule',
    {
      title: '[Admin] Ver regla de envío',
      description: 'Obtiene una regla de envío por ID.',
      inputSchema: { id: z.string().describe('ID de la regla') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`admin/store/shipping-rules/${id}`)
  )

  server.registerTool(
    'admin_create_shipping_rule',
    {
      title: '[Admin] Crear regla de envío',
      description: 'Crea una regla de costo de envío, opcionalmente limitada a un estado o ciudad.',
      inputSchema: {
        name: z.string().describe('Nombre de la regla'),
        price: z.number().min(0).describe('Costo base del envío'),
        ...shippingRuleFields,
      },
    },
    (body) => call('POST', 'admin/store/shipping-rules', { body })
  )

  server.registerTool(
    'admin_update_shipping_rule',
    {
      title: '[Admin] Actualizar regla de envío',
      description: 'Actualiza solo los campos enviados de una regla de envío.',
      inputSchema: {
        id: z.string().describe('ID de la regla'),
        name: z.string().optional().describe('Nombre de la regla'),
        price: z.number().min(0).optional().describe('Costo base del envío'),
        ...shippingRuleFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...body }) => call('PUT', path`admin/store/shipping-rules/${id}`, { body })
  )

  server.registerTool(
    'admin_delete_shipping_rule',
    {
      title: '[Admin] Eliminar regla de envío',
      description: 'Elimina una regla de envío.',
      inputSchema: { id: z.string().describe('ID de la regla') },
      annotations: { destructiveHint: true },
    },
    ({ id }) => call('DELETE', path`admin/store/shipping-rules/${id}`)
  )
}
