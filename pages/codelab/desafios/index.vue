<template>
  <div>
    <UiHero>
      <div class="text-center md:text-start py-6">
        <h1 class="text-balance text-xl lg:text-4xl text-gray-800 drop-shadow-lg dark:text-gray-50">
          Desafios de programación
        </h1>
        <h4 class="text-balance text-sm lg:text-lg text-gray-800 drop-shadow-lg dark:text-gray-50">
          Mejora tus habilidades de programación y resuelve problemas interesantes.
        </h4>
      </div>
    </UiHero>
    <div class="container mx-auto py-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="challenge in challenges?.data ?? []"
          :key="challenge.slug"
          class="rounded border p-3 bg-white shadow-md hover:shadow-lg transition duration-300 ease-in-out dark:bg-gray-800 dark:border-gray-700">
          <NuxtLink :to="`/codelab/desafios/${challenge.slug}`">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {{ challenge.name }}
            </h2>
          </NuxtLink>
          <p class="text-gray-600 dark:text-gray-400">
            <!-- badge -->
            {{ challenge.description }}
          </p>
          <div class="flex items-center justify-between mt-4">
            <NuxtLink :to="`/codelab/desafios/${challenge.slug}`">
              <DuiAction
                variant="ghost"
                color="primary"
                size="sm">
                <i class="mdi mdi-play" />
                Ver desafío
              </DuiAction>
            </NuxtLink>
            <div>
              <span class="block bg-blue-100 text-blue-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                {{ levelToString(challenge.level) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import  { DuiAction } from '@dronico/droni-kit'
useSeoMeta({
  title: 'Desafios de programación | Droni.co',
  ogTitle: 'Desafios de programación | Droni.co',
  description: 'Mejora tus habilidades de programación y resuelve problemas interesantes.',
  ogDescription: 'Mejora tus habilidades de programación y resuelve problemas interesantes.',
  ogImage: 'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
  twitterCard: 'summary_large_image',
  ogUrl: 'https://droni.co/codelab/desafios'
})
const filters = ref({ page: 1, itemsPerPage: 12 })
const challenges = ref(
  (await useFetch<Pagination<Challenge[]>>(`/api/appi/codevs/challenges?perPage=${filters.value.itemsPerPage}`)).data
  ?? { data: [] }
)

const levelToString = (level: number) => {
  switch (level) {
    case 1:
      return 'Fácil'
    case 2:
      return 'Intermedio'
    case 3:
      return 'Difícil'
    default:
      return 'Desconocido'
  }
}

</script>