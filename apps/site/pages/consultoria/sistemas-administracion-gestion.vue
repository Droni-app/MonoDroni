<template>
  <main class="service-page bg-[#f4f1eb] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <ConsultoriaServiceHero title="Sistemas de administración y gestión" :image="serviceImage" description="Personas analizando indicadores de gestión" />
    <ConsultoriaServiceIntro lead="Más control para decidir; menos tiempo buscando información." description="Construimos sistemas administrativos que organizan la operación y ponen la información correcta en el lugar correcto. Desde inventarios y clientes hasta finanzas, proyectos o recursos humanos, centralizamos la gestión para que tu equipo avance con confianza." :benefits="benefits" />
    <ConsultoriaServiceIncludes :items="includes" />
    <ConsultoriaServiceCta />
  </main>
</template>

<script setup lang="ts">
const benefits = [
  { title: 'Visibilidad operativa', text: 'Indicadores y estados claros para entender qué sucede en tiempo real.', icon: 'mdi mdi-eye-outline' },
  { title: 'Decisiones informadas', text: 'Reportes útiles que convierten los datos del día a día en acciones concretas.', icon: 'mdi mdi-chart-line' },
]
const includes = ['Mapa de procesos', 'Módulos administrativos', 'Tableros de indicadores', 'Gestión documental', 'Notificaciones y alertas', 'Migración y capacitación']
import serviceImage from '~/assets/img/pages/consultoria/sistemas-de-administracion-y-gestion.webp'
useSeoMeta({ title: 'Sistemas de administración y gestión | Droni.co', description: 'Sistemas administrativos para organizar la operación y tomar mejores decisiones.' })
</script>