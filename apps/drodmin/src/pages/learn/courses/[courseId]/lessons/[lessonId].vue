<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DuiButton, DuiModal } from '@dronico/droni-kit'
import LearnLessonForm from '../../../../../components/learn/LearnLessonForm.vue'
import AppiService from '../../../../../services/AppiService'
import type { LearnLesson, LearnLessonFormData } from '../../../../../types/AppiService'

const route = useRoute()
const router = useRouter()
const courseId = route.params.courseId as string
const lessonId = route.params.lessonId as string

const lesson = ref<LearnLesson | null>(null)
const loading = ref(false)
const fetching = ref(true)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)
const deleting = ref(false)

onMounted(async () => {
  try {
    const { data } = await AppiService.get<LearnLesson>(`/admin/learn/courses/${courseId}/lessons/${lessonId}`)
    lesson.value = data
  } catch {
    error.value = 'No se pudo cargar la lección.'
  } finally {
    fetching.value = false
  }
})

async function handleSubmit(data: LearnLessonFormData) {
  loading.value = true
  error.value = null
  try {
    await AppiService.patch(`/admin/learn/courses/${courseId}/lessons/${lessonId}`, data)
    router.push(`/learn/courses/${courseId}/lessons`)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al actualizar la lección.'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await AppiService.delete(`/admin/learn/courses/${courseId}/lessons/${lessonId}`)
    router.push(`/learn/courses/${courseId}/lessons`)
  } catch {
    error.value = 'Error al eliminar la lección.'
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

function toFormData(l: LearnLesson): LearnLessonFormData {
  return {
    name: l.name,
    description: l.description,
    format: l.format,
    content: l.content,
    activity: l.activity,
    video: l.video,
    order: l.order,
    active: l.active,
    limit_date: l.limitDate,
  }
}
</script>

<template>
  <div class="p-6">
    <RouterLink :to="`/learn/courses/${courseId}/lessons`" class="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
      <i class="mdi mdi-arrow-left mr-1" />Lecciones
    </RouterLink>
    <h1 class="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Editar lección</h1>

    <p v-if="fetching" class="text-slate-500 dark:text-slate-400">Cargando...</p>

    <LearnLessonForm
      v-else-if="lesson"
      :initial-value="toFormData(lesson)"
      :course-id="courseId"
      :lesson-id="lesson.id"
      :loading="loading"
      :error="error"
      deletable
      @submit="handleSubmit"
      @delete="showDeleteModal = true"
    />

    <p v-else class="text-red-500">{{ error }}</p>

    <DuiModal v-model="showDeleteModal">
      <template #header>Eliminar lección</template>
      <p class="text-slate-600 dark:text-slate-300">
        ¿Estás seguro de que deseas eliminar esta lección? Esta acción no se puede deshacer.
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
