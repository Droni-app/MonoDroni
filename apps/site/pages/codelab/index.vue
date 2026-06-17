<template>
  <div>
    <UiHero>
      <div class="text-center md:text-start py-6">
        <h1
          class="text-balance text-xl lg:text-4xl text-gray-800 drop-shadow-lg dark:text-gray-50"
        >
          Laboratorio de código y programación
        </h1>
        <h4
          class="text-balance text-sm lg:text-lg text-gray-800 drop-shadow-lg dark:text-gray-50"
        >
          Disfruta de algunas de nuestras herramientas y recursos para el
          desarrollo de software.
        </h4>
      </div>
    </UiHero>
    <div class="container mx-auto py-5">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Desafíos Card -->
        <div class="mx-auto w-full">
          <div class="flex flex-col rounded-2xl shadow-lg overflow-hidden bg-gradient-to-r from-zinc-50 to-slate-100 text-zinc-800 dark:from-slate-800 dark:to-zinc-900 dark:text-zinc-50 h-full">
            <!-- Imagen -->
            <div class="flex-shrink-0">
              <img
                src="~/assets/img/pages/desafios-de-programacion.webp"
                alt="Desafíos de programación"
                class="w-full h-48 object-cover rounded-t-2xl dark:invert"
              >
            </div>

            <!-- Contenido -->
            <div class="p-6 flex flex-col justify-center flex-1">
              <NuxtLink to="/codelab/desafios">
                <h2 class="text-2xl font-bold mb-4">Desafíos de programación</h2>
              </NuxtLink>
              <p class="text-zinc-600 dark:text-zinc-400">
                Mejora tus habilidades de programación y resuelve problemas
                interesantes. Puedes encontrar una variedad de desafíos que te
                ayudarán a practicar y mejorar tus habilidades de codificación.
              </p>
            </div>
          </div>
        </div>

        <!-- JSON to TypeScript Card -->
        <div class="mx-auto w-full">
          <div class="flex flex-col rounded-2xl shadow-lg overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-100 text-zinc-800 dark:from-indigo-900 dark:to-blue-900 dark:text-zinc-50 h-full">
            <!-- Imagen -->
            <div class="flex-shrink-0">
              <img
                src="~/assets/img/pages/convertir-json-a-typescript.webp"
                alt="Convertir JSON a TypeScript"
                class="w-full h-48 object-cover rounded-t-2xl dark:invert"
              >
            </div>

            <!-- Contenido -->
            <div class="p-6 flex flex-col justify-center flex-1">
              <NuxtLink to="/codelab/json-to-ts">
                <h2 class="text-2xl font-bold mb-4">JSON a TypeScript</h2>
              </NuxtLink>
              <p class="text-zinc-600 dark:text-zinc-300">
                Convierte automáticamente estructuras JSON en interfaces TypeScript.
                Una herramienta práctica para generar tipos desde tus datos JSON
                de forma rápida y eficiente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
useSeoMeta({
  title: "Laboratorio de código y programación | Droni.co",
  ogTitle: "Laboratorio de código y programación | Droni.co",
  description: "Disfruta de algunas de nuestras herramientas y recursos para el desarrollo de software.",
  ogDescription: "Disfruta de algunas de nuestras herramientas y recursos para el desarrollo de software.",
  ogImage: "/_nuxt/assets/img/pages/convertir-json-a-typescript.webp",
  twitterImage: "/_nuxt/assets/img/pages/convertir-json-a-typescript.webp",
  twitterCard: "summary_large_image",
});
</script>
