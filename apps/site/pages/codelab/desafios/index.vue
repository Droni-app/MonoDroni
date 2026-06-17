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
      <div class="mb-6">
        <div class="flex flex-col md:flex-row gap-3">
          <div class="flex-1">
            <DuiInput
              v-model="searchQuery"
              placeholder="Buscar desafios..."
              type="text"
              class="w-full"
              @keyup.enter="submitSearch"
            />
          </div>
          <div class="w-full md:w-48">
            <DuiSelect
              v-model="selectedLevel"
              :options="levelOptions"
              placeholder="Todas las dificultades"
              :nullable="true"
            />
          </div>
        </div>
      </div>
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
      <div v-if="!challenges?.data || challenges.data.length === 0" class="py-12 text-center">
        <div class="text-6xl mb-4">🤔</div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Parece que no hay desafios...
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          O eres demasiado inteligente para nuestros desafios, o tu búsqueda necesita un poco de ayuda.
        </p>
        <DuiButton 
          color="primary"
          @click="resetFilters"
        >
          <i class="mdi mdi-refresh" />
          Limpiar filtros
        </DuiButton>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { DuiAction, DuiInput, DuiSelect, DuiButton } from '@dronico/droni-kit'

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
const searchQuery = ref('')
const searchQuerySubmitted = ref('')
const selectedLevel = ref<string>('')

const levelOptions = [
  { label: 'Todas las dificultades', value: '' },
  { label: 'Fácil', value: '1' },
  { label: 'Intermedio', value: '2' },
  { label: 'Difícil', value: '3' },
]

const submitSearch = () => {
  searchQuerySubmitted.value = searchQuery.value
}

const resetFilters = () => {
  searchQuery.value = ''
  searchQuerySubmitted.value = ''
  selectedLevel.value = ''
}

const { data: challenges } = useFetch<Pagination<Challenge[]>>(() => {
  const params = new URLSearchParams({
    perPage: String(filters.value.itemsPerPage),
    page: String(filters.value.page),
  })
  
  if (searchQuerySubmitted.value) {
    params.append('search', searchQuerySubmitted.value)
  }
  
  if (selectedLevel.value) {
    params.append('level', String(selectedLevel.value))
  }
  
  return `/api/codelab/challenges?${params.toString()}`
}, {
  watch: [filters, searchQuerySubmitted, selectedLevel],
})

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