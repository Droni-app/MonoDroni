<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DuiButton, DuiLabel, DuiSelect, DuiInput, DuiAlert, DuiModal } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { LearnEnrollment } from '../../../types/AppiService'

const route = useRoute()
const router = useRouter()

const enrollment = ref<LearnEnrollment | null>(null)
const fetching = ref(true)
const loading = ref(false)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)
const deleting = ref(false)

const role = ref<'student' | 'teacher' | 'admin'>('student')
const status = ref<'pending' | 'active' | 'completed' | 'canceled'>('pending')
const progress = ref('0')

const roleOptions = [
  { label: 'Estudiante', value: 'student' },
  { label: 'Profesor', value: 'teacher' },
  { label: 'Admin', value: 'admin' },
]
const statusOptions = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Activo', value: 'active' },
  { label: 'Completado', value: 'completed' },
  { label: 'Cancelado', value: 'canceled' },
]

onMounted(async () => {
  try {
    const { data } = await AppiService.get<LearnEnrollment>(`/admin/learn/enrollments/${route.params.id}`)
    enrollment.value = data
    role.value = data.role
    status.value = data.status
    progress.value = String(data.progress)
  } catch {
    error.value = 'No se pudo cargar la inscripción.'
  } finally {
    fetching.value = false
  }
})

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    await AppiService.patch(`/admin/learn/enrollments/${route.params.id}`, {
      role: role.value,
      status: status.value,
      progress: Number(progress.value),
    })
    router.push('/learn/enrollments')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al actualizar la inscripción.'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await AppiService.delete(`/admin/learn/enrollments/${route.params.id}`)
    router.push('/learn/enrollments')
  } catch {
    error.value = 'Error al eliminar la inscripción.'
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Editar inscripción</h1>

    <p v-if="fetching" class="text-slate-500 dark:text-slate-400">Cargando...</p>

    <form v-else-if="enrollment" class="flex flex-col gap-4 max-w-md" @submit.prevent="handleSubmit">
      <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>

      <p class="text-sm text-slate-600 dark:text-slate-300">
        <span class="font-semibold">{{ enrollment.user?.fullName }}</span>
        en
        <span class="font-semibold">{{ enrollment.course?.name }}</span>
      </p>

      <DuiLabel title="Rol">
        <DuiSelect v-model="role" :options="roleOptions" item-label="label" item-value="value" block />
      </DuiLabel>

      <DuiLabel title="Estado">
        <DuiSelect v-model="status" :options="statusOptions" item-label="label" item-value="value" block />
      </DuiLabel>

      <DuiLabel title="Progreso (%)">
        <DuiInput v-model="progress" block type="number" min="0" max="100" />
      </DuiLabel>

      <div class="flex gap-3 mt-2">
        <DuiButton type="button" color="danger" @click="showDeleteModal = true">
          <i class="mdi mdi-delete" />
        </DuiButton>
        <div class="flex gap-3 justify-end flex-1">
          <RouterLink to="/learn/enrollments">
            <DuiButton type="button" color="neutral">Cancelar</DuiButton>
          </RouterLink>
          <DuiButton type="submit" color="primary" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </DuiButton>
        </div>
      </div>
    </form>

    <p v-else class="text-red-500">{{ error }}</p>

    <DuiModal v-model="showDeleteModal">
      <template #header>Eliminar inscripción</template>
      <p class="text-slate-600 dark:text-slate-300">
        ¿Estás seguro de que deseas eliminar esta inscripción? Esta acción no se puede deshacer.
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
