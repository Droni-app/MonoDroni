<template>
  <main class="service-page bg-[#f4f1eb] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <ConsultoriaServiceHero title="Administración de propiedad horizontal" :image="serviceImage" description="Edificio residencial moderno" />
    <ConsultoriaServiceIntro lead="Comunidades mejor informadas, operaciones más transparentes." description="Diseñamos soluciones para administrar propiedades horizontales con menos trámites y más confianza. Residentes, administradores, consejos y proveedores encuentran en un mismo sistema la información, las solicitudes y los pagos que necesitan." :benefits="benefits" />
    <ConsultoriaServiceIncludes :items="includes" />
    <ConsultoriaServiceCta />
  </main>
</template>

<script setup lang="ts">
const benefits = [
  { title: 'Comunicación directa', text: 'Avisos, novedades y solicitudes disponibles para la comunidad en un solo canal.', icon: 'mdi mdi-message-text-outline' },
  { title: 'Cuentas claras', text: 'Cuotas, pagos, presupuestos y documentos organizados y consultables.', icon: 'mdi mdi-file-document-check-outline' },
]
const includes = ['Directorio de copropietarios', 'Cuotas y pagos', 'Reservas de zonas comunes', 'PQRS y solicitudes', 'Comunicados y documentos', 'Proveedores y mantenimientos']
import serviceImage from '~/assets/img/pages/consultoria/plataforma-gestion-plataforma-propiedad-horizontal.webp'
useSeoMeta({ title: 'Administración de propiedad horizontal | Droni.co', description: 'Soluciones digitales para administrar propiedades horizontales con transparencia y confianza.' })
</script>