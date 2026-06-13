<template>
  <div>
    <UiHero>
      <div class="text-center md:text-start py-6">
        <h1 class="text-balance lg:text-4xl text-gray-800 drop-shadow-lg dark:text-gray-50">
          Proyectos de la comunidad
        </h1>
        <h4 class="text-balance text-sm lg:text-lg text-gray-800 drop-shadow-lg dark:text-gray-50">
          Desarrollamos algo más que un producto, creamos una comunidad.
        </h4>
      </div>
    </UiHero>
    <div class="container mx-auto py-5">
      <div class="mx-auto p-6 max-w-4xl">
        <div class="flex flex-col md:flex-row rounded-2xl shadow-lg overflow-hidden bg-gradient-to-r from-zinc-50 to-slate-100 text-zinc-800 dark:from-slate-800 dark:to-zinc-900 dark:text-zinc-50">

          <!-- Contenido -->
          <div class="p-6 flex flex-col justify-center">
            <h2 class="text-2xl font-bold mb-4">Droni-kit</h2>
            <p class="text-zinc-600 dark:text-zinc-400">
              Un catálogo de componentes de Vue 3 para el desarrollo de aplicaciones
              web. Droni-kit es un kit de herramientas de código abierto que
              proporciona una colección de componentes reutilizables y personalizables
              para facilitar el desarrollo de aplicaciones web.
            </p>
            <div class="mt-4">
              <NuxtLink to="https://github.com/Droni-app/droni-kit" title="Github repo">
                <DuiAction href="https://github.com/Droni-app/droni-kit" variant="ghost" size="sm">
                  <i class="mdi mdi-github"/>
                  Github repo
                </DuiAction>
              </NuxtLink>
              <NuxtLink to="https://droni-app.github.io/droni-kit/" title="Documentación de Droni-kit">
                <DuiAction variant="ghost" size="sm">
                  <i class="mdi mdi-text-box-search-outline"/>
                  Catálogo de componentes
                </DuiAction>
              </NuxtLink>
            </div>
          </div>
          <div class="flex-shrink-0">
            <img
              src="~/assets/img/pages/droni-kit.webp"
              alt="Droni-kit | Catálogo de componentes"
              class="w-full md:w-60 h-48 md:h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { DuiAction } from '@dronico/droni-kit';

useSeoMeta({
  title: 'Proyectos de la comunidad | Droni.co',
  ogTitle: 'Proyectos de la comunidad | Droni.co',
  description: 'Desarrollamos algo más que un producto, creamos una comunidad.',
  ogDescription: 'Desarrollamos algo más que un producto, creamos una comunidad.',
  ogImage: 'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
  twitterCard: 'summary_large_image',
})
</script>