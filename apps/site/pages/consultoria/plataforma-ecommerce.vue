<template>
  <main class="service-page bg-[#f4f1eb] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <ConsultoriaServiceHero title="Plataforma eCommerce" :image="serviceImage" description="Persona comprando desde una tienda digital" />
    <ConsultoriaServiceIntro lead="Vender en línea debería ser tan claro como comprar." description="Desarrollamos experiencias de comercio electrónico que presentan tus productos con intención, reducen la fricción de compra y le dan a tu equipo las herramientas para operar. Conectamos catálogo, pagos, envíos y comunicación en una experiencia de principio a fin." :benefits="benefits" />
    <ConsultoriaServiceIncludes :items="includes" />
    <ConsultoriaServiceCta />
  </main>
</template>

<script setup lang="ts">
const benefits = [
  { title: 'Compra sin fricción', text: 'Catálogos claros, búsqueda útil y un checkout pensado para terminar la compra.', icon: 'mdi mdi-cart-check-outline' },
  { title: 'Operación conectada', text: 'Pedidos, inventario y clientes organizados para que vender sea sostenible.', icon: 'mdi mdi-link-variant' },
]
const includes = ['Catálogo y filtros', 'Carrito y checkout', 'Pagos y facturación', 'Inventario y pedidos', 'Cupones y promociones', 'Analítica de ventas']
import serviceImage from '~/assets/img/pages/consultoria/plataformas-de-comercio-electronico.webp'
useSeoMeta({ title: 'Plataforma eCommerce | Droni.co', description: 'Experiencias de comercio electrónico conectadas con catálogo, pagos y operación.' })
</script>