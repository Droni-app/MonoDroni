<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { DuiButton, DuiAlert } from '@dronico/droni-kit'
import AppiService from '../../services/AppiService'
import type { LearnLessonQuestionsQuiz, PaginatedResponse } from '../../types/AppiService'

const props = defineProps<{ courseId: string; lessonId: string }>()

const quizzes = ref<LearnLessonQuestionsQuiz[]>([])
const loading = ref(false)
const deletingId = ref<string | null>(null)
const error = ref<string | null>(null)

async function fetchQuizzes() {
  loading.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<LearnLessonQuestionsQuiz>>(
      `/admin/learn/courses/${props.courseId}/lessons/${props.lessonId}/quizzes`,
      { params: { per_page: 50 } }
    )
    quizzes.value = data.data
  } catch {
    error.value = 'Error al cargar los intentos de cuestionario.'
  } finally {
    loading.value = false
  }
}

async function deleteQuiz(id: string) {
  deletingId.value = id
  error.value = null
  try {
    await AppiService.delete(`/admin/learn/courses/${props.courseId}/lessons/${props.lessonId}/quizzes/${id}`)
    quizzes.value = quizzes.value.filter((q) => q.id !== id)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al eliminar el intento.'
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchQuizzes)
</script>

<template>
  <div class="flex flex-col gap-3">
    <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>

    <div v-if="loading" class="text-sm text-slate-500 dark:text-slate-400">Cargando...</div>
    <div v-else-if="quizzes.length === 0" class="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
      Sin intentos de cuestionario
    </div>
    <div v-else class="flex flex-col gap-2">
      <div
        v-for="quiz in quizzes"
        :key="quiz.id"
        class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      >
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            {{ quiz.enrollment?.user?.fullName ?? quiz.enrollment?.userId ?? quiz.learnEnrollmentId }}
          </p>
          <p class="text-sm text-slate-800 dark:text-slate-100">
            {{ quiz.status === 'completed' ? `${quiz.results ?? 0}% aciertos` : 'Pendiente' }}
          </p>
        </div>
        <DuiButton type="button" size="sm" color="danger" :disabled="deletingId === quiz.id" @click="deleteQuiz(quiz.id)">
          <i class="mdi mdi-trash-can" />
        </DuiButton>
      </div>
    </div>
  </div>
</template>
