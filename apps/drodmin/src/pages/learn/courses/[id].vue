<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DuiButton, DuiModal } from '@dronico/droni-kit'
import LearnCourseForm from '../../../components/learn/LearnCourseForm.vue'
import AppiService from '../../../services/AppiService'
import type { LearnCourse, LearnCourseFormData } from '../../../types/AppiService'

const route = useRoute()
const router = useRouter()

const course = ref<LearnCourse | null>(null)
const loading = ref(false)
const fetching = ref(true)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)
const deleting = ref(false)

onMounted(async () => {
  try {
    const { data } = await AppiService.get<LearnCourse>(`/admin/learn/courses/${route.params.id}`)
    course.value = data
  } catch {
    error.value = 'No se pudo cargar el curso.'
  } finally {
    fetching.value = false
  }
})

async function handleSubmit(data: LearnCourseFormData) {
  loading.value = true
  error.value = null
  try {
    await AppiService.patch(`/admin/learn/courses/${route.params.id}`, data)
    router.push('/learn/courses')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al actualizar el curso.'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await AppiService.delete(`/admin/learn/courses/${route.params.id}`)
    router.push('/learn/courses')
  } catch {
    error.value = 'Error al eliminar el curso.'
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

function toFormData(c: LearnCourse): LearnCourseFormData {
  return {
    name: c.name,
    group: c.group,
    description: c.description,
    picture: c.picture,
    video: c.video,
    auto_enroll: c.autoEnroll,
    active: c.active,
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Editar curso</h1>
      <div v-if="course" class="flex gap-2">
        <RouterLink :to="`/learn/courses/${course.id}/lessons`">
          <DuiButton size="sm" color="secondary"><i class="mdi mdi-book-open-page-variant mr-1" />Lecciones</DuiButton>
        </RouterLink>
        <RouterLink :to="`/learn/courses/${course.id}/questions`">
          <DuiButton size="sm" color="secondary"><i class="mdi mdi-help-circle mr-1" />Banco de preguntas</DuiButton>
        </RouterLink>
      </div>
    </div>

    <p v-if="fetching" class="text-slate-500 dark:text-slate-400">Cargando...</p>

    <LearnCourseForm
      v-else-if="course"
      :initial-value="toFormData(course)"
      :loading="loading"
      :error="error"
      deletable
      @submit="handleSubmit"
      @delete="showDeleteModal = true"
    />

    <p v-else class="text-red-500">{{ error }}</p>

    <DuiModal v-model="showDeleteModal">
      <template #header>Eliminar curso</template>
      <p class="text-slate-600 dark:text-slate-300">
        ¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.
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
