<template>
  <article v-if="course">
    <UiHero>
      <div class="text-center md:text-start py-8 md:flex md:items-center gap-8">
        <div class="grow my-auto">
          <div class="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
            <DuiBadge v-if="course.group" :label="course.group" color="secondary" variant="soft" />
            <DuiBadge :label="`${lessons.length} lecciones`" color="primary" variant="soft" />
          </div>
          <h1 class="text-balance text-3xl lg:text-5xl text-gray-800 drop-shadow-lg dark:text-gray-50">
            {{ course.name }}
          </h1>
          <p class="py-3 text-balance text-gray-700 dark:text-gray-200 max-w-2xl mx-auto md:mx-0">
            {{ course.description }}
          </p>
        </div>
        <div v-if="course.picture" class="shrink-0">
          <NuxtImg
            :src="course.picture"
            :alt="course.name"
            class="w-56 md:w-80 rounded-2xl shadow-xl mx-auto bg-slate-100 dark:bg-slate-700 p-2"
          />
        </div>
      </div>
    </UiHero>

    <div class="container mx-auto px-2 md:px-auto py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <!-- Main column -->
      <div class="lg:col-span-2 flex flex-col gap-8">
        <div v-if="course.video" class="aspect-video rounded-xl overflow-hidden shadow-lg">
          <iframe
            :src="getVideoUrl(course.video)"
            title="Video del curso"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="w-full h-full"
          />
        </div>

        <section>
          <UiTitle>Contenido del curso</UiTitle>
          <DuiSkeleton v-if="lessonsPending" variant="rounded" height="260px" class="w-full" />
          <ol v-else-if="lessons.length" class="flex flex-col gap-2">
            <li v-for="(lesson, index) in lessons" :key="lesson.id">
              <NuxtLink
                :to="`/cursos/${course.slug}/${lesson.slug}`"
                class="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:border-cyan-400 dark:hover:border-cyan-600 hover:shadow transition-all"
              >
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {{ index + 1 }}
                </span>
                <div class="grow min-w-0">
                  <p class="font-medium text-gray-800 dark:text-gray-100 truncate">{{ lesson.name }}</p>
                  <p v-if="lesson.description" class="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {{ lesson.description }}
                  </p>
                </div>
                <DuiBadge v-if="lesson.video" label="Video" color="secondary" variant="soft" size="sm" />
                <i class="mdi mdi-chevron-right text-gray-400" />
              </NuxtLink>
            </li>
          </ol>
          <p v-else class="text-gray-500 dark:text-gray-400">
            Este curso todavía no tiene lecciones publicadas.
          </p>
        </section>
      </div>

      <!-- Sidebar -->
      <aside class="lg:sticky lg:top-6">
        <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-lg p-6 flex flex-col gap-4">
          <DuiAlert v-if="enrollMessage" :color="enrollError ? 'danger' : 'success'">
            {{ enrollMessage }}
          </DuiAlert>

          <DuiAlert v-if="enrolled" color="success">
            <i class="mdi mdi-check-circle mr-1" />
            Ya estás inscrito en este curso.
          </DuiAlert>
          <DuiButton
            v-else-if="!siteAuth.isAuthenticated.value"
            :block="true"
            color="primary"
            to="/login"
          >
            <i class="mdi mdi-login mr-1" />
            Inicia sesión para inscribirte
          </DuiButton>
          <DuiButton
            v-else-if="course.autoEnroll"
            :block="true"
            color="primary"
            :loading="enrolling"
            @click="enroll"
          >
            <i class="mdi mdi-school mr-1" />
            Inscribirme gratis
          </DuiButton>
          <DuiAlert v-else color="neutral">
            Este curso es por invitación. Contáctanos para inscribirte.
          </DuiAlert>

          <ul class="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
            <li class="flex items-center gap-2">
              <i class="mdi mdi-book-open-page-variant" />
              {{ lessons.length }} lecciones
            </li>
            <li v-if="course.group" class="flex items-center gap-2">
              <i class="mdi mdi-shape" />
              {{ course.group }}
            </li>
            <li class="flex items-center gap-2">
              <i class="mdi mdi-infinity" />
              Acceso de por vida
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </article>
  <div v-else class="container mx-auto px-2 py-16 text-center text-gray-500 dark:text-gray-400">
    Curso no encontrado.
  </div>
</template>
<script setup lang="ts">
import { DuiBadge, DuiButton, DuiAlert, DuiSkeleton } from '@dronico/droni-kit'

const route = useRoute()
const siteAuth = useSiteAuth()

const { data: course } = await useFetch<LearnCourse>(
  () => `/api/appi/learn/courses/${route.params.slug}`,
  { key: () => `learn-course-${route.params.slug}` }
)

const { data: lessonsResponse, pending: lessonsPending } = await useFetch<LearnPagination<LearnLesson>>(
  () => `/api/appi/learn/courses/${route.params.slug}/lessons`,
  {
    key: () => `learn-course-lessons-${route.params.slug}`,
    query: { per_page: 100 },
  }
)

const lessons = computed(() => lessonsResponse.value?.data ?? [])

const enrolling = ref(false)
const enrolled = ref(!!course.value?.enrollment)
const enrollError = ref(false)
const enrollMessage = ref<string | null>(null)

async function enroll() {
  if (!course.value) return
  enrolling.value = true
  enrollError.value = false
  enrollMessage.value = null
  try {
    await $fetch(`/api/appi/learn/courses/${course.value.slug}/enrollments`, { method: 'POST' })
    enrolled.value = true
    enrollMessage.value = '¡Listo! Ya estás inscrito en este curso.'
  } catch (e: any) {
    // The generic /api/appi proxy doesn't catch errors, so appi's error body
    // arrives wrapped one level deeper (e.data.data) via h3's default error handling.
    const message =
      e?.data?.data?.message ?? e?.data?.message ?? e?.statusMessage ?? e?.message ?? 'No se pudo completar la inscripción.'
    if (String(message).toLowerCase().includes('ya estás inscrito')) {
      enrolled.value = true
      enrollMessage.value = 'Ya estás inscrito en este curso.'
    } else {
      enrollError.value = true
      enrollMessage.value = message
    }
  } finally {
    enrolling.value = false
  }
}

function getVideoUrl(video: string) {
  let videoId = video.split('v=')[1]
  const ampersandPosition = videoId?.indexOf('&')
  if (ampersandPosition && ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition)
  }
  return `https://www.youtube.com/embed/${videoId}`
}

useHead({
  link: [
    { rel: 'canonical', href: `https://droni.co/cursos/${course.value?.slug}` },
  ],
})
useSeoMeta({
  title: () => course.value ? `${course.value.name} | Droni.co` : 'Curso | Droni.co',
  ogTitle: () => course.value?.name,
  description: () => course.value?.description ?? undefined,
  ogDescription: () => course.value?.description ?? undefined,
  ogImage: () => course.value?.picture ?? undefined,
  twitterCard: 'summary_large_image',
  ogUrl: () => `https://droni.co/cursos/${course.value?.slug}`,
})
</script>
