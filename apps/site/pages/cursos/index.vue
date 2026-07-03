<template>
  <div>
    <UiHero>
      <div class="text-center md:text-start py-6">
        <h1 class="text-balance text-xl lg:text-4xl text-gray-800 drop-shadow-lg dark:text-gray-50">
          Cursos de programación
        </h1>
        <h4 class="text-balance text-sm lg:text-lg text-gray-800 drop-shadow-lg dark:text-gray-50">
          Aprende a programar y desarrolla tus habilidades en el mundo del software.
        </h4>
      </div>
    </UiHero>
    <div class="container mx-auto px-2 py-3">
      <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <DuiSkeleton v-for="n in 8" :key="n" variant="rounded" height="220px" class="w-full" />
      </div>
      <div v-else-if="courses?.data?.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <LearnCourseCard
          v-for="course in courses.data"
          :key="course.id"
          :course="course"
        />
      </div>
      <p v-else class="text-center text-gray-500 dark:text-gray-400 py-10">
        Todavía no hay cursos publicados. ¡Vuelve pronto!
      </p>

      <div v-if="courses && filters.page < courses.meta.lastPage" class="text-center py-3">
        <DuiButton :loading="loadingMore" @click="moreCourses">
          <i class="mdi mdi-plus" />
          Ver más...
        </DuiButton>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { DuiButton, DuiSkeleton } from '@dronico/droni-kit'

const filters = ref({ page: 1, perPage: 12 })
const loadingMore = ref(false)

const { data: courses, pending } = await useFetch<LearnPagination<LearnCourse>>(
  '/api/appi/learn/courses',
  { query: { per_page: filters.value.perPage } }
)

async function moreCourses() {
  if (!courses.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const nextPage = filters.value.page + 1
    const data = await $fetch<LearnPagination<LearnCourse>>('/api/appi/learn/courses', {
      query: { page: nextPage, per_page: filters.value.perPage },
    })
    courses.value.data = [...courses.value.data, ...data.data]
    courses.value.meta = data.meta
    filters.value.page = nextPage
  } finally {
    loadingMore.value = false
  }
}

useSeoMeta({
  title: 'Cursos de programación | Droni.co',
  ogTitle: 'Cursos de programación | Droni.co',
  description: 'Aprende a programar y desarrolla tus habilidades en el mundo del software.',
  ogDescription: 'Aprende a programar y desarrolla tus habilidades en el mundo del software.',
  ogImage: 'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
  twitterCard: 'summary_large_image',
})
</script>
