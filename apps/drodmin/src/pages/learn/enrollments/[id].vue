<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DuiCard, DuiForm, DuiAlert, DuiButton, DuiInput, DuiLabel, DuiSelect, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../../services/AppiService'
import { useFetchItem } from '../../../composables/useFetchItem'
import { formatDateTime } from '../../../utils/format'
import { ENROLLMENT_ROLES, ENROLLMENT_STATUSES } from '../../../utils/labels'
import PageHeader from '../../../components/ui/PageHeader.vue'
import UserAvatar from '../../../components/ui/UserAvatar.vue'
import ConfirmDelete from '../../../components/ui/ConfirmDelete.vue'
import type { LearnEnrollment } from '../../../types/AppiService'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const url = `/admin/learn/enrollments/${route.params.id}`
const { item: enrollment, error } = useFetchItem<LearnEnrollment>(url)

const form = reactive({ role: 'student', status: 'pending', progress: 0 })
const saving = ref(false)
watch(enrollment, (e) => {
  if (e) Object.assign(form, { role: e.role, status: e.status, progress: Number(e.progress) })
})

async function save() {
  saving.value = true
  try {
    await AppiService.patch(url, form)
    toast.success('Inscripción guardada.')
    router.push('/learn/enrollments')
  } catch (e) {
    toast.error(apiError(e, 'Error al guardar la inscripción.'))
  } finally {
    saving.value = false
  }
}

async function remove() {
  try {
    await AppiService.delete(url)
    toast.success('Inscripción eliminada.')
    router.push('/learn/enrollments')
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar la inscripción.'))
  }
}
</script>

<template>
  <PageHeader title="Inscripción" back="/learn/enrollments" />
  <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
  <p v-else-if="!enrollment" class="text-slate-500">Cargando...</p>

  <DuiCard v-else class="max-w-2xl">
    <DuiForm :loading="saving" @submit="save">
      <template #header>
        <div class="flex flex-wrap items-center gap-3">
          <UserAvatar :user="enrollment.user" size="md" />
          <span class="text-slate-400">en</span>
          <RouterLink :to="`/learn/courses/${enrollment.courseId}`" class="font-medium hover:underline">{{ enrollment.course?.name }}</RouterLink>
        </div>
        <p class="mt-1 text-xs text-slate-400">Inscrito el {{ formatDateTime(enrollment.createdAt) }}</p>
      </template>
      <div class="grid gap-4 sm:grid-cols-3">
        <DuiLabel title="Rol en el curso">
          <DuiSelect v-model="form.role" :options="ENROLLMENT_ROLES" item-label="label" item-value="value" block />
        </DuiLabel>
        <DuiLabel title="Estado">
          <DuiSelect v-model="form.status" :options="ENROLLMENT_STATUSES" item-label="label" item-value="value" block />
        </DuiLabel>
        <DuiLabel title="Progreso (%)" help-text="Se recalcula solo cuando el estudiante ve lecciones">
          <DuiInput v-model.number="form.progress" block type="number" min="0" max="100" />
        </DuiLabel>
      </div>
      <template #footer>
        <ConfirmDelete :action="remove" message="¿Eliminar esta inscripción? Se perderá el progreso, respuestas e intentos del usuario en el curso." />
        <DuiButton variant="ghost" class="ml-auto" to="/learn/enrollments">Cancelar</DuiButton>
        <DuiButton type="submit" color="primary" :loading="saving">
          <i class="mdi mdi-content-save-outline mr-1" /> Guardar
        </DuiButton>
      </template>
    </DuiForm>
  </DuiCard>
</template>
