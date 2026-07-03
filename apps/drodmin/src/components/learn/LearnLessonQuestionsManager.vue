<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DuiButton, DuiSelect, DuiAlert } from '@dronico/droni-kit'
import AppiService from '../../services/AppiService'
import type { LearnLessonQuestion, LearnQuestion, PaginatedResponse } from '../../types/AppiService'

const props = defineProps<{ courseId: string; lessonId: string }>()

const linked = ref<LearnLessonQuestion[]>([])
const courseQuestions = ref<LearnQuestion[]>([])
const loading = ref(false)
const linking = ref(false)
const unlinkingId = ref<string | null>(null)
const selectedQuestionId = ref<string | undefined>(undefined)
const error = ref<string | null>(null)

const availableQuestions = computed(() => {
  const linkedIds = new Set(linked.value.map((l) => l.questionId))
  return courseQuestions.value.filter((q) => !linkedIds.has(q.id))
})

async function fetchAll() {
  loading.value = true
  try {
    const [linkedRes, questionsRes] = await Promise.all([
      AppiService.get<LearnLessonQuestion[]>(
        `/admin/learn/courses/${props.courseId}/lessons/${props.lessonId}/exam-questions`
      ),
      AppiService.get<PaginatedResponse<LearnQuestion>>(`/admin/learn/courses/${props.courseId}/questions`, {
        params: { per_page: 100 },
      }),
    ])
    linked.value = linkedRes.data
    courseQuestions.value = questionsRes.data.data
  } catch {
    error.value = 'Error al cargar las preguntas vinculadas.'
  } finally {
    loading.value = false
  }
}

async function linkQuestion() {
  if (!selectedQuestionId.value) return
  linking.value = true
  error.value = null
  try {
    const { data } = await AppiService.post<LearnLessonQuestion>(
      `/admin/learn/courses/${props.courseId}/lessons/${props.lessonId}/exam-questions`,
      { question_id: selectedQuestionId.value }
    )
    linked.value.push({ ...data, question: courseQuestions.value.find((q) => q.id === selectedQuestionId.value) })
    selectedQuestionId.value = undefined
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al vincular la pregunta.'
  } finally {
    linking.value = false
  }
}

async function unlinkQuestion(id: string) {
  unlinkingId.value = id
  error.value = null
  try {
    await AppiService.delete(`/admin/learn/courses/${props.courseId}/lessons/${props.lessonId}/exam-questions/${id}`)
    linked.value = linked.value.filter((l) => l.id !== id)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al desvincular la pregunta.'
  } finally {
    unlinkingId.value = null
  }
}

onMounted(fetchAll)
</script>

<template>
  <div class="flex flex-col gap-3">
    <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>

    <div class="flex flex-col gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Vincular pregunta del banco</p>
      <DuiSelect
        v-model="selectedQuestionId"
        :options="availableQuestions"
        item-label="name"
        item-value="id"
        placeholder="Selecciona una pregunta"
        block
      />
      <DuiButton type="button" color="primary" size="sm" :disabled="linking || !selectedQuestionId" @click="linkQuestion">
        <i class="mdi mdi-link-variant mr-1" />{{ linking ? 'Vinculando...' : 'Vincular' }}
      </DuiButton>
    </div>

    <div v-if="loading" class="text-sm text-slate-500 dark:text-slate-400">Cargando...</div>
    <div v-else-if="linked.length === 0" class="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
      Sin preguntas vinculadas
    </div>
    <div v-else class="flex flex-col gap-2">
      <div
        v-for="item in linked"
        :key="item.id"
        class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm text-slate-800 dark:text-slate-100 truncate">{{ item.question?.name ?? item.questionId }}</p>
        </div>
        <DuiButton
          type="button"
          size="sm"
          color="danger"
          :disabled="unlinkingId === item.id"
          @click="unlinkQuestion(item.id)"
        >
          <i class="mdi mdi-link-variant-off" />
        </DuiButton>
      </div>
    </div>
  </div>
</template>
