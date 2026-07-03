<!-- eslint-disable vue/no-v-html -->
<template>
  <article v-if="course && lesson">
    <UiHero>
      <div class="py-6">
        <NuxtLink
          :to="`/cursos/${course.slug}`"
          class="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-2"
        >
          <i class="mdi mdi-arrow-left" />
          {{ course.name }}
        </NuxtLink>
        <h1 class="text-balance text-2xl lg:text-4xl text-gray-800 drop-shadow-lg dark:text-gray-50">
          {{ lesson.name }}
        </h1>
        <p v-if="lesson.description" class="text-balance text-sm lg:text-lg text-gray-700 dark:text-gray-200 mt-2">
          {{ lesson.description }}
        </p>
      </div>
    </UiHero>

    <div class="container mx-auto px-2 md:px-auto py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <!-- Main column -->
      <div class="lg:col-span-2 flex flex-col gap-8">
        <div v-if="lesson.video" class="aspect-video rounded-xl overflow-hidden shadow-lg">
          <iframe
            :src="getVideoUrl(lesson.video)"
            title="Video de la lección"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="w-full h-full"
          />
        </div>

        <article
          v-if="lesson.format === 'markdown'"
          class="prose lg:prose-xl max-w-full dark:prose-invert"
          v-html="markdown.render(lesson.content ?? '')"
        />
        <article
          v-else-if="lesson.format === 'html'"
          class="prose lg:prose-xl max-w-full dark:prose-invert"
          v-html="lesson.content ?? ''"
        />
        <p v-else class="whitespace-pre-line text-gray-700 dark:text-gray-200">
          {{ lesson.content }}
        </p>

        <!-- Activity -->
        <section v-if="lesson.activity" class="flex flex-col gap-4">
          <UiTitle>Actividad</UiTitle>
          <DuiAlert color="neutral">{{ lesson.activity }}</DuiAlert>

          <DuiAlert v-if="!isEnrolled" color="warning">
            Inscríbete al curso para enviar tu respuesta.
          </DuiAlert>
          <div
            v-else-if="lesson.myAnswer"
            class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-4 flex flex-col gap-2"
          >
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tu respuesta</p>
            <p class="whitespace-pre-line text-gray-800 dark:text-gray-100">{{ lesson.myAnswer.answer }}</p>
            <template v-if="lesson.myAnswer.result !== null">
              <DuiBadge :label="`Calificación: ${lesson.myAnswer.result}%`" color="success" class="w-fit" />
              <p v-if="lesson.myAnswer.feedback" class="text-sm text-gray-600 dark:text-gray-300">
                {{ lesson.myAnswer.feedback }}
              </p>
            </template>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
              Tu respuesta está en revisión.
            </p>
          </div>
          <form v-else class="flex flex-col gap-3" @submit.prevent="submitAnswer">
            <DuiTextarea
              v-model="answerForm.answer"
              block
              :autoheight="true"
              placeholder="Escribe tu respuesta..."
              required
            />
            <DuiInput v-model="answerForm.attachment" block placeholder="URL de un archivo adjunto (opcional)" />
            <DuiAlert v-if="answerError" color="danger">{{ answerError }}</DuiAlert>
            <DuiButton type="submit" color="primary" :loading="submittingAnswer" class="w-fit">
              Enviar respuesta
            </DuiButton>
          </form>
        </section>

        <!-- Quiz -->
        <section v-if="lesson.quizQuestions?.length" class="flex flex-col gap-4">
          <UiTitle>Cuestionario</UiTitle>

          <DuiAlert v-if="!isEnrolled" color="warning">
            Inscríbete al curso para tomar el cuestionario.
          </DuiAlert>

          <div
            v-else-if="quizResult && !retaking"
            class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-4 flex flex-col gap-3"
          >
            <p class="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Resultado: {{ quizResult.results ?? 0 }}% de aciertos
            </p>
            <DuiButton color="secondary" size="sm" class="w-fit" @click="retaking = true">
              <i class="mdi mdi-refresh mr-1" />
              Reintentar
            </DuiButton>
          </div>

          <form v-else class="flex flex-col gap-4" @submit.prevent="submitQuiz">
            <div
              v-for="(question, index) in lesson.quizQuestions"
              :key="question.id"
              class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-4"
            >
              <p class="font-medium text-gray-800 dark:text-gray-100 mb-2">
                {{ index + 1 }}. {{ question.name }}
              </p>
              <DuiRadio v-model="quizAnswers[question.id]" :options="questionOptions(question)" :name="`question-${question.id}`" />
            </div>
            <DuiAlert v-if="quizError" color="danger">{{ quizError }}</DuiAlert>
            <DuiButton
              type="submit"
              color="primary"
              class="w-fit"
              :loading="submittingQuiz"
              :disabled="!allQuestionsAnswered"
            >
              Enviar cuestionario
            </DuiButton>
          </form>
        </section>

        <!-- Prev / next navigation -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <NuxtLink
            v-if="previousLesson"
            :to="`/cursos/${course.slug}/${previousLesson.slug}`"
            class="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <i class="mdi mdi-chevron-left" />
            {{ previousLesson.name }}
          </NuxtLink>
          <span v-else />
          <NuxtLink
            v-if="nextLesson"
            :to="`/cursos/${course.slug}/${nextLesson.slug}`"
            class="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {{ nextLesson.name }}
            <i class="mdi mdi-chevron-right" />
          </NuxtLink>
        </div>
      </div>

      <!-- Sidebar: mini curriculum -->
      <aside class="lg:sticky lg:top-6">
        <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-lg p-4 flex flex-col gap-1">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 pb-2">
            Contenido del curso
          </p>
          <NuxtLink
            v-for="(item, index) in lessons"
            :key="item.id"
            :to="`/cursos/${course.slug}/${item.slug}`"
            class="flex items-center gap-2 p-2 rounded-lg text-sm transition-colors"
            :class="item.slug === lesson.slug
              ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 font-medium'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'"
          >
            <span class="shrink-0">{{ index + 1 }}.</span>
            <span class="truncate">{{ item.name }}</span>
          </NuxtLink>
        </div>
      </aside>
    </div>
  </article>
  <div v-else class="container mx-auto px-2 py-16 text-center text-gray-500 dark:text-gray-400">
    Lección no encontrada.
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import { DuiAlert, DuiBadge, DuiButton, DuiInput, DuiTextarea, DuiRadio } from '@dronico/droni-kit'

const markdown = new MarkdownIt()
const route = useRoute()

const { data: course } = await useFetch<LearnCourse>(
  () => `/api/appi/learn/courses/${route.params.slug}`,
  { key: () => `learn-course-${route.params.slug}` }
)

const { data: lessonsResponse } = await useFetch<LearnPagination<LearnLesson>>(
  () => `/api/appi/learn/courses/${route.params.slug}/lessons`,
  {
    key: () => `learn-course-lessons-${route.params.slug}`,
    query: { per_page: 100 },
  }
)
const lessons = computed(() => lessonsResponse.value?.data ?? [])

const { data: lesson, refresh: refreshLesson } = await useFetch<LearnLesson>(
  () => `/api/appi/learn/courses/${route.params.slug}/lessons/${route.params.lessonSlug}`,
  { key: () => `learn-lesson-${route.params.slug}-${route.params.lessonSlug}` }
)

const isEnrolled = computed(() => !!course.value?.enrollment)

const currentIndex = computed(() => lessons.value.findIndex((l) => l.slug === route.params.lessonSlug))
const previousLesson = computed(() =>
  currentIndex.value > 0 ? lessons.value[currentIndex.value - 1] : null
)
const nextLesson = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < lessons.value.length - 1
    ? lessons.value[currentIndex.value + 1]
    : null
)

function getVideoUrl(video: string) {
  let videoId = video.split('v=')[1]
  const ampersandPosition = videoId?.indexOf('&')
  if (ampersandPosition && ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition)
  }
  return `https://www.youtube.com/embed/${videoId}`
}

function extractApiErrorMessage(e: any, fallback: string) {
  // The generic /api/appi proxy doesn't catch errors, so appi's error body
  // arrives wrapped one level deeper (e.data.data) via h3's default error handling.
  return e?.data?.data?.message ?? e?.data?.message ?? e?.statusMessage ?? e?.message ?? fallback
}

// --- Activity ---
const answerForm = reactive({ answer: '', attachment: '' })
const submittingAnswer = ref(false)
const answerError = ref<string | null>(null)

async function submitAnswer() {
  if (!course.value || !lesson.value) return
  submittingAnswer.value = true
  answerError.value = null
  try {
    await $fetch(`/api/appi/learn/courses/${course.value.slug}/lessons/${lesson.value.slug}/answers`, {
      method: 'POST',
      body: { answer: answerForm.answer, attachment: answerForm.attachment || null },
    })
    await refreshLesson()
  } catch (e: any) {
    answerError.value = extractApiErrorMessage(e, 'No se pudo enviar tu respuesta.')
  } finally {
    submittingAnswer.value = false
  }
}

// --- Quiz ---
const quizAnswers = reactive<Record<string, string>>({})
const submittingQuiz = ref(false)
const quizError = ref<string | null>(null)
const retaking = ref(false)
const quizResult = computed(() => (lesson.value?.myQuiz?.status === 'completed' ? lesson.value.myQuiz : null))

const allQuestionsAnswered = computed(
  () => lesson.value?.quizQuestions?.every((q) => !!quizAnswers[q.id]) ?? false
)

function questionOptions(question: LearnQuizQuestion) {
  const options: { label: string; value: string }[] = [
    { label: question.response_1, value: '1' },
    { label: question.response_2, value: '2' },
  ]
  if (question.response_3) options.push({ label: question.response_3, value: '3' })
  if (question.response_4) options.push({ label: question.response_4, value: '4' })
  if (question.response_5) options.push({ label: question.response_5, value: '5' })
  return options
}

async function submitQuiz() {
  if (!course.value || !lesson.value) return
  submittingQuiz.value = true
  quizError.value = null
  try {
    await $fetch(`/api/appi/learn/courses/${course.value.slug}/lessons/${lesson.value.slug}/quizzes`, {
      method: 'POST',
      body: {
        answers: Object.entries(quizAnswers).map(([question_id, selected]) => ({
          question_id,
          selected: Number(selected),
        })),
      },
    })
    retaking.value = false
    await refreshLesson()
  } catch (e: any) {
    quizError.value = extractApiErrorMessage(e, 'No se pudo enviar el cuestionario.')
  } finally {
    submittingQuiz.value = false
  }
}

useSeoMeta({
  title: () => (lesson.value && course.value ? `${lesson.value.name} · ${course.value.name} | Droni.co` : 'Lección | Droni.co'),
  description: () => lesson.value?.description ?? undefined,
  robots: 'noindex',
})
</script>
