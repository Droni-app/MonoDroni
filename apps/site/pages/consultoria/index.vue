<template>
  <main class="consultoria-page overflow-hidden bg-[#f4f1eb] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <section class="relative border-b border-slate-900/10 dark:border-white/10">
      <div class="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-24">
        <div class="relative z-10">
          <p class="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-pink-600 dark:text-pink-400"><span class="h-px w-10 bg-pink-600 dark:bg-pink-400" />Consultoría digital</p>
          <h1 class="max-w-4xl text-5xl font-black leading-[.95] tracking-tight sm:text-7xl lg:text-[6.5rem]">Ideas que se convierten en <span class="text-pink-600 dark:text-pink-400">sistemas.</span></h1>
          <p class="mt-8 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">Diseñamos y construimos productos digitales que hacen más simple tu operación, conectan a tus usuarios y abren nuevas oportunidades para tu negocio.</p>
          <a href="#servicios" class="mt-9 inline-flex items-center gap-3 bg-slate-900 px-6 py-4 text-sm font-bold text-white transition hover:bg-pink-600 dark:bg-pink-500 dark:text-slate-950 dark:hover:bg-pink-400">Explorar servicios <i class="mdi mdi-arrow-down" /></a>
        </div>
        <div class="relative min-h-[25rem] sm:min-h-[31rem]">
          <div class="absolute right-0 top-0 h-4/5 w-4/5 bg-pink-500/90 dark:bg-pink-600/80" />
          <img :src="consultoriaImage" alt="Equipo colaborando en el diseño de un producto digital" class="absolute bottom-0 left-0 h-[88%] w-[88%] object-cover grayscale-[15%]">
          <div class="absolute bottom-6 right-4 flex h-28 w-28 items-center justify-center bg-[#f4f1eb] text-center text-xs font-bold uppercase leading-4 tracking-widest text-slate-900 dark:bg-slate-950 dark:text-white sm:bottom-10 sm:right-8">Droni.co<br>Consulting</div>
        </div>
      </div>
      <div class="pointer-events-none absolute -bottom-3 left-1/2 hidden -translate-x-1/2 text-[11rem] font-black leading-none text-slate-900/[.035] lg:block">DRONI</div>
    </section>

    <section id="servicios" class="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
      <div class="mb-14 max-w-2xl"><p class="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-pink-600 dark:text-pink-400">Lo que hacemos</p><h2 class="text-4xl font-black tracking-tight sm:text-6xl">Tecnología útil, hecha para avanzar.</h2><p class="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">Acompañamos cada etapa: desde ordenar una idea hasta convertirla en una plataforma confiable, medible y lista para crecer.</p></div>
      <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="(service, index) in services" :key="service.slug" :to="`/consultoria/${service.slug}`" class="service-card group relative flex min-h-[25rem] flex-col justify-between overflow-hidden bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-slate-900" :class="index === 0 ? 'md:col-span-2 lg:col-span-2' : ''">
          <div class="absolute inset-0 bg-cover bg-center opacity-0 transition duration-500 group-hover:opacity-20" :style="`background-image: url('${service.image}')`" />
          <div class="relative flex items-start justify-between"><span class="text-5xl font-black text-pink-500/30">0{{ index + 1 }}</span><span class="flex h-10 w-10 items-center justify-center border border-slate-200 text-xl transition group-hover:border-pink-500 group-hover:bg-pink-500 group-hover:text-white dark:border-slate-700"><i :class="service.icon" /></span></div>
          <div class="relative"><h3 class="max-w-lg text-2xl font-black leading-tight sm:text-3xl">{{ service.title }}</h3><p class="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">{{ service.summary }}</p><span class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-pink-600 transition group-hover:gap-4 dark:text-pink-400">Ver servicio <i class="mdi mdi-arrow-right" /></span></div>
        </NuxtLink>
      </div>
    </section>

    <section class="bg-slate-900 text-white dark:bg-pink-500 dark:text-slate-950"><div class="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-20"><div><p class="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-pink-400 dark:text-slate-950/70">¿Tienes un reto?</p><h2 class="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">Hablemos de lo que quieres construir.</h2></div><NuxtLink to="/login" class="inline-flex shrink-0 items-center justify-center gap-3 self-start border border-white/40 px-6 py-4 text-sm font-bold transition hover:bg-white hover:text-slate-900 dark:border-slate-950/40 dark:hover:bg-slate-950 dark:hover:text-white lg:self-center">Cuéntanos tu idea <i class="mdi mdi-arrow-top-right" /></NuxtLink></div></section>
  </main>
</template>

<script setup lang="ts">
import consultoriaImage from '~/assets/img/pages/consultoria/consultoria-de-software.webp'
import webMovilImage from '~/assets/img/pages/consultoria/desarrollo-web-y-movil.webp'
import gestionImage from '~/assets/img/pages/consultoria/sistemas-de-administracion-y-gestion.webp'
import educacionImage from '~/assets/img/pages/consultoria/plataformas-de-educacion-virtual.webp'
import ecommerceImage from '~/assets/img/pages/consultoria/plataformas-de-comercio-electronico.webp'
import propiedadImage from '~/assets/img/pages/consultoria/plataforma-gestion-plataforma-propiedad-horizontal.webp'

const services = [
  { slug: 'desarrollo-web-movil', title: 'Desarrollo web y móvil', summary: 'Experiencias rápidas, accesibles y adaptadas a cada pantalla para que tu producto esté donde están tus usuarios.', icon: 'mdi mdi-cellphone-link', image: webMovilImage },
  { slug: 'sistemas-administracion-gestion', title: 'Sistemas de administración y gestión', summary: 'Información centralizada, automatizaciones y tableros para tomar mejores decisiones.', icon: 'mdi mdi-chart-box-outline', image: gestionImage },
  { slug: 'plataforma-educacion-virtual', title: 'Plataforma de educación virtual', summary: 'Aulas digitales para enseñar, acompañar y medir el aprendizaje con una experiencia propia.', icon: 'mdi mdi-school-outline', image: educacionImage },
  { slug: 'plataforma-ecommerce', title: 'Plataforma eCommerce', summary: 'Tiendas que hacen que descubrir, comprar y volver a comprar sea una experiencia natural.', icon: 'mdi mdi-cart-outline', image: ecommerceImage },
  { slug: 'administracion-propiedad-horizontal', title: 'Administración de propiedad horizontal', summary: 'Una operación más transparente para administradores, residentes, proveedores y consejos.', icon: 'mdi mdi-domain', image: propiedadImage },
]

useSeoMeta({ title: 'Consultoría digital | Droni.co', description: 'Desarrollo de productos digitales, plataformas y sistemas de gestión a la medida.' })
</script>