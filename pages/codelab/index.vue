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
      <div class="mx-auto p-6 max-w-4xl">
        <div class="flex flex-col md:flex-row rounded-2xl shadow-lg overflow-hidden bg-gradient-to-r from-zinc-50 to-slate-100 text-zinc-800 dark:from-slate-800 dark:to-zinc-900 dark:text-zinc-50">
          <!-- Imagen -->
          <div class="flex-shrink-0">
            <img
              src="~/assets/img/pages/desafios-de-programacion.webp"
              alt="Desafíos de programación"
              class="w-full md:w-60 h-48 md:h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none dark:invert"
            >
          </div>

          <!-- Contenido -->
          <div class="p-6 flex flex-col justify-center">
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
    </div>
  </div>
</template>
<script setup lang="ts">
useSeoMeta({
  title: "Laboratorio de código y programación | Droni.co",
  ogTitle: "Laboratorio de código y programación | Droni.co",
  description: "Disfruta de algunas de nuestras herramientas y recursos para el desarrollo de software.",
  ogDescription: "Disfruta de algunas de nuestras herramientas y recursos para el desarrollo de software.",
  ogImage: "https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png",
  twitterCard: "summary_large_image",
});
</script>
