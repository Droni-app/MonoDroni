// Admin modules and their sections. Used by the navbar and the home dashboard.
export const modules = [
  {
    label: 'Contenido',
    icon: 'mdi-file-document-multiple-outline',
    children: [
      { label: 'Posts', to: '/content/posts', icon: 'mdi-post-outline' },
      { label: 'Archivos', to: '/content/attachments', icon: 'mdi-paperclip' },
    ],
  },
  {
    label: 'Social',
    icon: 'mdi-forum-outline',
    children: [
      { label: 'Comentarios', to: '/social/comments', icon: 'mdi-comment-text-outline' },
      { label: 'Temas', to: '/social/topics', icon: 'mdi-message-text-outline' },
    ],
  },
  {
    label: 'Tienda',
    icon: 'mdi-storefront-outline',
    children: [
      { label: 'Productos', to: '/store/products', icon: 'mdi-package-variant-closed' },
      { label: 'Pedidos', to: '/store/orders', icon: 'mdi-cart-outline' },
      { label: 'Pagos', to: '/store/payments', icon: 'mdi-credit-card-outline' },
      { label: 'Cupones', to: '/store/coupons', icon: 'mdi-ticket-percent-outline' },
      { label: 'Reglas de envío', to: '/store/shipping-rules', icon: 'mdi-truck-outline' },
    ],
  },
  {
    label: 'Aprendizaje',
    icon: 'mdi-school-outline',
    children: [
      { label: 'Cursos', to: '/learn/courses', icon: 'mdi-book-open-page-variant-outline' },
      { label: 'Inscripciones', to: '/learn/enrollments', icon: 'mdi-account-school-outline' },
    ],
  },
]
