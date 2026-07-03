<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { DuiButton, DuiInput, DuiAlert } from '@dronico/droni-kit'
import AppiService from '../../services/AppiService'
import type { LearnLessonAnswer, PaginatedResponse } from '../../types/AppiService'

const props = defineProps<{ courseId: string; lessonId: string }>()

const answers = ref<LearnLessonAnswer[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const editingId = ref<string | null>(null)
const savingId = ref<string | null>(null)
const draft = reactive({ feedback: '', result: '' })

async function fetchAnswers() {
  loading.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<LearnLessonAnswer>>(
      `/admin/learn/courses/${props.courseId}/lessons/${props.lessonId}/answers`,
      { params: { per_page: 50 } }
    )
    answers.value = data.data
  } catch {
    error.value = 'Error al cargar las respuestas.'
  } finally {
    loading.value = false
  }
}

function startEdit(answer: LearnLessonAnswer) {
  editingId.value = answer.id
  draft.feedback = answer.feedback ?? ''
  draft.result = answer.result != null ? String(answer.result) : ''
}

async function saveGrade(answer: LearnLessonAnswer) {
  savingId.value = answer.id
  error.value = null
  try {
    const { data } = await AppiService.patch<LearnLessonAnswer>(
      `/admin/learn/courses/${props.courseId}/lessons/${props.lessonId}/answers/${answer.id}`,
      { feedback: draft.feedback || null, result: draft.result === '' ? null : Number(draft.result) }
    )
    const index = answers.value.findIndex((a) => a.id === answer.id)
    if (index !== -1) answers.value[index] = data
    editingId.value = null
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al calificar la respuesta.'
  } finally {
    savingId.value = null
  }
}

onMounted(fetchAnswers)
</script>

<template>
  <div class="flex flex-col gap-3">
    <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>

    <div v-if="loading" class="text-sm text-slate-500 dark:text-slate-400">Cargando...</div>
    <div v-else-if="answers.length === 0" class="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
      Sin respuestas
    </div>
    <div v-else class="flex flex-col gap-2">
      <div
        v-for="answer in answers"
        :key="answer.id"
        class="flex flex-col gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      >
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
          {{ answer.enrollment?.user?.fullName ?? answer.enrollment?.userId ?? answer.learnEnrollmentId }}
        </p>
        <p class="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-line">{{ answer.answer }}</p>

        <template v-if="editingId === answer.id">
          <DuiInput v-model="draft.feedback" block placeholder="Feedback" />
          <DuiInput v-model="draft.result" block type="number" min="0" max="100" placeholder="Resultado (0-100)" />
          <div class="flex gap-2 justify-end">
            <DuiButton type="button" size="sm" color="neutral" @click="editingId = null">Cancelar</DuiButton>
            <DuiButton type="button" size="sm" color="primary" :disabled="savingId === answer.id" @click="saveGrade(answer)">
              {{ savingId === answer.id ? 'Guardando...' : 'Guardar' }}
            </DuiButton>
          </div>
        </template>
        <template v-else>
          <p v-if="answer.feedback" class="text-xs text-slate-500 dark:text-slate-400">Feedback: {{ answer.feedback }}</p>
          <p v-if="answer.result != null" class="text-xs text-slate-500 dark:text-slate-400">Resultado: {{ answer.result }}</p>
          <DuiButton type="button" size="sm" color="secondary" @click="startEdit(answer)">
            <i class="mdi mdi-pencil mr-1" />Calificar
          </DuiButton>
        </template>
      </div>
    </div>
  </div>
</template>
