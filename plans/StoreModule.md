# Modulo de Tienda (Store Module)

## Appi 
### Modelos
- store_products
  - id uuid
  - site_id uuid
  - slug string (unique per site)
  - name string
  - description text
  - content text
  - picture string
  - price decimal
  - stock integer
  - tags array of strings
  - size_w decimal
  - size_h decimal
  - size_d decimal
  - weight decimal
  - active boolean
  - created_at timestamp
  - updated_at timestamp

- store_product_attributes
  - id uuid
  - product_id uuid
  - name string
  - value string

- store_orders
  - id uuid
  - site_id uuid
  - user_id uuid
  - status string (pending, paid, shipped, completed, canceled)
  - total decimal
  - shipping_address json
  - billing_address json
  - created_at timestamp
  - updated_at timestamp

- store_order_items
  - id uuid
  - order_id uuid
  - product_id uuid
  - quantity integer
  - price decimal
  - created_at timestamp
  - updated_at timestamp

- store_coupons
  - id uuid
  - site_id uuid
  - code string (unique per site)
  - discount decimal
  - discount_type string (percentage, fixed)
  - minimum_order_value decimal
  - expiration_date timestamp
  - active boolean
  - created_at timestamp
  - updated_at timestamp

- store_states
  - id integer
  - name string
  - code string (unique)
  - country string
  - created_at timestamp
  - updated_at timestamp

- store_cities
  - id integer
  - name string
  - state_id integer
  - created_at timestamp
  - updated_at timestamp

- store_addresses
  - id uuid
  - user_id uuid
  - site_id uuid
  - city_id integer
  - address_line1 string
  - address_line2 string
  - postal_code string
  - phone string
  - comments string
  - created_at timestamp
  - updated_at timestamp

- store_shipping_methods
  - id uuid
  - site_id uuid
  - name string
  - city_id integer
  - price decimal
  - active boolean
  - created_at timestamp
  - updated_at timestamp

- store_payment
  - id uuid
  - order_id uuid
  - payment_method string (credit_card, paypal, bank_transfer, etc.)
  - payment_status string (pending, completed, failed)
  - transaction_id string
  - amount decimal
  - currency string
  - created_at timestamp
  - updated_at timestamp

### Controllers
 admin/store/
  - products_controller (Create Read Update Delete)
  - orders_controller (Read Update)
  - payments_controller (Read Update)
  - coupons_controller (Create Read Update Delete)
  - shipping_methods_controller (Create Read Update Delete)

## Drodmin

### Pages
store/products
- Listado de productos
- Crear producto
- Editar producto
- Eliminar producto
store/orders
- Listado de pedidos
- Ver detalles del pedido
- Actualizar estado del pedido
store/payments
- Listado de pagos
- Ver detalles del pago
store/coupons
- Listado de cupones
- Crear cupón
- Editar cupón
- Eliminar cupón
store/shipping_methods
- Listado de métodos de envío
- Crear método de envío
- Editar método de envío
- Eliminar método de envío
