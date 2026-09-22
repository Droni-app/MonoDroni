<template>
  <main class="service-page bg-[#f4f1eb] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <ConsultoriaServiceHero title="Desarrollo web y móvil" :image="serviceImage" description="Persona usando una aplicación móvil" />
    <ConsultoriaServiceIntro lead="Tu producto debe sentirse natural en cualquier pantalla." description="Creamos sitios web, portales y aplicaciones móviles con una experiencia consistente, rápida y accesible. Definimos la arquitectura, el diseño y la tecnología adecuada para que el producto sea fácil de usar hoy y sencillo de evolucionar mañana." :benefits="benefits" />
    <ConsultoriaServiceIncludes :items="includes" />
    <ConsultoriaServiceCta />
  </main>
</template>

<script setup lang="ts">
const benefits = [
  { title: 'Experiencia multiplataforma', text: 'Una interfaz coherente en móvil, tablet y escritorio, con flujos pensados para cada contexto.', icon: 'mdi mdi-devices' },
  { title: 'Rendimiento real', text: 'Cargas rápidas, código mantenible y una base preparada para crecer con tus usuarios.', icon: 'mdi mdi-speedometer' },
]
const includes = ['Descubrimiento y definición de alcance', 'Diseño de interfaz y experiencia', 'Desarrollo frontend y backend', 'Integraciones con tus servicios', 'Pruebas y control de calidad', 'Despliegue y acompañamiento']
import serviceImage from '~/assets/img/pages/consultoria/desarrollo-web-y-movil.webp'
useSeoMeta({ title: 'Desarrollo web y móvil | Droni.co', description: 'Sitios web, portales y aplicaciones móviles rápidas, accesibles y escalables.' })
</script>