<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DuiButton, DuiInput, DuiLabel, DuiModal, DuiSelect, DuiPagination, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../services/AppiService'
import { usePaginatedList } from '../../composables/usePaginatedList'
import { formatDateTime } from '../../utils/format'
import { QUIZ_STATUSES } from '../../utils/labels'
import UserAvatar from '../ui/UserAvatar.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import ConfirmDelete from '../ui/ConfirmDelete.vue'
import EmptyState from '../ui/EmptyState.vue'
import type { LearnLessonQuestionsQuiz } from '../../types/AppiService'

// Exam attempts submitted by students for this lesson.
const props = defineProps<{ courseId: string; lessonId: string }>()

const toast = useToast()
const url = `/admin/learn/courses/${props.courseId}/lessons/${props.lessonId}/quizzes`
const { rows, loading, pagination, fetch } = usePaginatedList<LearnLessonQuestionsQuiz>(url)

// --- Detail / grade modal ---
const selected = ref<LearnLessonQuestionsQuiz | null>(null)
const showModal = ref(false)
const saving = ref(false)
const form = ref({ status: 'pending', results: '' as number | '' })

function open(quiz: LearnLessonQuestionsQuiz) {
  selected.value = quiz
  form.value = { status: quiz.status, results: quiz.results ?? '' }
  showModal.value = true
}

// `questions`/`answers` are JSON text columns in appi
const parse = <T,>(value: T[] | string): T[] => (typeof value === 'string' ? JSON.parse(value) : value) ?? []
const questions = computed(() => (selected.value ? parse(selected.value.questions) : []))
const answers = computed(() => (selected.value ? parse(selected.value.answers) : []))

function answerFor(questionId: string) {
  return answers.value.find((a) => a.question_id === questionId)
}

async function save() {
  saving.value = true
  try {
    await AppiService.patch(`${url}/${selected.value!.id}`, {
      status: form.value.status,
      results: form.value.results === '' ? null : form.value.results,
    })
    toast.success('Intento actualizado.')
    showModal.value = false
    fetch(pagination.value.page)
  } catch (e) {
    toast.error(apiError(e, 'Error al actualizar el intento.'))
  } finally {
    saving.value = false
  }
}

async function remove(quiz: LearnLessonQuestionsQuiz) {
  try {
    await AppiService.delete(`${url}/${quiz.id}`)
    toast.success('Intento eliminado.')
    fetch(pagination.value.page)
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar el intento.'))
  }
}

onMounted(() => fetch())
</script>

<template>
  <div class="flex flex-col gap-4">
    <p v-if="loading && !rows.length" class="text-sm text-slate-500">Cargando...</p>
    <EmptyState v-else-if="!rows.length" icon="mdi-clipboard-check-outline" text="Nadie ha presentado el examen todavía." />

    <ul v-else class="divide-y divide-slate-200 dark:divide-slate-700">
      <li v-for="quiz in rows" :key="quiz.id" class="flex flex-wrap items-center gap-3 py-3">
        <UserAvatar :user="quiz.enrollment?.user" />
        <span class="text-xs text-slate-400">{{ formatDateTime(quiz.createdAt) }}</span>
        <StatusBadge :status="quiz.status" />
        <span class="font-semibold">{{ quiz.results != null ? `${Number(quiz.results)}%` : '—' }}</span>
        <div class="ml-auto flex gap-1">
          <DuiButton variant="ghost" size="sm" @click="open(quiz)">
            <i class="mdi mdi-eye-outline mr-1" /> Ver
          </DuiButton>
          <ConfirmDelete :action="() => remove(quiz)" label="" size="sm" />
        </div>
      </li>
    </ul>

    <DuiPagination
      v-if="pagination.total > pagination.perPage"
      :model-value="pagination.page"
      :total="pagination.total"
      :per-page="pagination.perPage"
      size="sm"
      @update:model-value="fetch"
    />

    <DuiModal v-model="showModal" title="Intento de examen" size="lg">
      <div v-if="selected" class="flex flex-col gap-4">
        <UserAvatar :user="selected.enrollment?.user" size="md" />
        <ol class="flex flex-col gap-2">
          <li
            v-for="(question, index) in questions"
            :key="question.id"
            class="flex items-start gap-2 rounded-lg p-2 text-sm"
            :class="answerFor(question.id)?.correct ? 'bg-green-500/10' : 'bg-red-500/10'"
          >
            <i :class="['mdi', answerFor(question.id)?.correct ? 'mdi-check-circle text-green-600' : 'mdi-close-circle text-red-500']" />
            <span class="flex-1">{{ index + 1 }}. {{ question.name }}</span>
            <span class="text-xs text-slate-500">
              Eligió {{ answerFor(question.id)?.selected ?? '—' }} · correcta {{ question.response_correct }}
            </span>
          </li>
        </ol>
        <div class="grid gap-4 sm:grid-cols-2">
          <DuiLabel title="Estado">
            <DuiSelect v-model="form.status" :options="QUIZ_STATUSES" item-label="label" item-value="value" block />
          </DuiLabel>
          <DuiLabel title="Resultado (%)">
            <DuiInput v-model.number="form.results" block type="number" min="0" max="100" />
          </DuiLabel>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <DuiButton variant="ghost" @click="showModal = false">Cerrar</DuiButton>
          <DuiButton color="primary" :loading="saving" @click="save">Guardar</DuiButton>
        </div>
      </template>
    </DuiModal>
  </div>
</template>
