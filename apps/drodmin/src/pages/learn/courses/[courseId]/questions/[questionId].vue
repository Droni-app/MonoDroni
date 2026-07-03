<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DuiButton, DuiModal } from '@dronico/droni-kit'
import LearnQuestionForm from '../../../../../components/learn/LearnQuestionForm.vue'
import AppiService from '../../../../../services/AppiService'
import type { LearnQuestion, LearnQuestionFormData } from '../../../../../types/AppiService'

const route = useRoute()
const router = useRouter()
const courseId = route.params.courseId as string
const questionId = route.params.questionId as string

const question = ref<LearnQuestion | null>(null)
const loading = ref(false)
const fetching = ref(true)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)
const deleting = ref(false)

onMounted(async () => {
  try {
    const { data } = await AppiService.get<LearnQuestion>(`/admin/learn/courses/${courseId}/questions/${questionId}`)
    question.value = data
  } catch {
    error.value = 'No se pudo cargar la pregunta.'
  } finally {
    fetching.value = false
  }
})

async function handleSubmit(data: LearnQuestionFormData) {
  loading.value = true
  error.value = null
  try {
    await AppiService.patch(`/admin/learn/courses/${courseId}/questions/${questionId}`, data)
    router.push(`/learn/courses/${courseId}/questions`)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al actualizar la pregunta.'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await AppiService.delete(`/admin/learn/courses/${courseId}/questions/${questionId}`)
    router.push(`/learn/courses/${courseId}/questions`)
  } catch {
    error.value = 'Error al eliminar la pregunta.'
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

function toFormData(q: LearnQuestion): LearnQuestionFormData {
  return {
    name: q.name,
    description: q.description,
    picture: q.picture,
    attachment: q.attachment,
    response_1: q.response1,
    response_2: q.response2,
    response_3: q.response3,
    response_4: q.response4,
    response_5: q.response5,
    response_correct: q.responseCorrect,
  }
}
</script>

<template>
  <div class="p-6">
    <RouterLink :to="`/learn/courses/${courseId}/questions`" class="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
      <i class="mdi mdi-arrow-left mr-1" />Banco de preguntas
    </RouterLink>
    <h1 class="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Editar pregunta</h1>

    <p v-if="fetching" class="text-slate-500 dark:text-slate-400">Cargando...</p>

    <LearnQuestionForm
      v-else-if="question"
      :initial-value="toFormData(question)"
      :course-id="courseId"
      :loading="loading"
      :error="error"
      deletable
      @submit="handleSubmit"
      @delete="showDeleteModal = true"
    />

    <p v-else class="text-red-500">{{ error }}</p>

    <DuiModal v-model="showDeleteModal">
      <template #header>Eliminar pregunta</template>
      <p class="text-slate-600 dark:text-slate-300">
        ¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <DuiButton color="neutral" @click="showDeleteModal = false">Cancelar</DuiButton>
          <DuiButton color="danger" :disabled="deleting" @click="handleDelete">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </DuiButton>
        </div>
      </template>
    </DuiModal>
  </div>
</template>
