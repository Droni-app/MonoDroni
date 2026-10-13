<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiCard, DuiForm, DuiInput, DuiTextarea, DuiButton, DuiLabel, DuiSwitch, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../services/AppiService'
import { emptyToNull } from '../../utils/format'
import AttachmentInput from '../AttachmentInput.vue'
import ConfirmDelete from '../ui/ConfirmDelete.vue'
import type { LearnCourse } from '../../types/AppiService'

// Creates a course when `course` is missing, edits it otherwise.
const props = defineProps<{ course?: LearnCourse }>()

const router = useRouter()
const toast = useToast()
const saving = ref(false)
const c = props.course

const form = reactive({
  name: c?.name ?? '',
  group: c?.group ?? '',
  description: c?.description ?? '',
  picture: c?.picture ?? null,
  video: c?.video ?? '',
  auto_enroll: c ? !!c.autoEnroll : false,
  active: c ? !!c.active : false,
})

async function save() {
  saving.value = true
  try {
    const payload = emptyToNull({ ...form })
    if (c) {
      await AppiService.patch(`/admin/learn/courses/${c.id}`, payload)
      toast.success('Curso guardado.')
    } else {
      const { data } = await AppiService.post<LearnCourse>('/admin/learn/courses', payload)
      toast.success('Curso creado.')
      router.push(`/learn/courses/${data.id}`)
    }
  } catch (e) {
    toast.error(apiError(e, 'Error al guardar el curso.'))
  } finally {
    saving.value = false
  }
}

async function remove() {
  try {
    await AppiService.delete(`/admin/learn/courses/${c!.id}`)
    toast.success('Curso eliminado.')
    router.push('/learn/courses')
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar el curso.'))
  }
}
</script>

<template>
  <DuiForm :loading="saving" @submit="save">
    <div class="grid items-start gap-6 lg:grid-cols-3">
      <DuiCard title="Información" class="lg:col-span-2">
        <div class="flex flex-col gap-4">
          <DuiLabel title="Nombre" required>
            <DuiInput v-model="form.name" block placeholder="Nombre del curso" required />
          </DuiLabel>
          <DuiLabel title="Descripción">
            <DuiTextarea v-model="form.description" block rows="6" placeholder="¿De qué trata el curso?" />
          </DuiLabel>
          <DuiLabel title="Video de presentación">
            <DuiInput v-model="form.video" block placeholder="https://youtube.com/..." />
          </DuiLabel>
        </div>
      </DuiCard>

      <DuiCard>
        <div class="flex flex-col gap-4">
          <DuiLabel title="Imagen">
            <AttachmentInput v-model="form.picture" />
          </DuiLabel>
          <DuiLabel title="Grupo" help-text="Agrupa cursos para filtrarlos al inscribir usuarios">
            <DuiInput v-model="form.group" block placeholder="Ej: 2026-A" />
          </DuiLabel>
          <DuiSwitch v-model="form.active" label="Curso activo" color="success" />
          <DuiSwitch v-model="form.auto_enroll" label="Auto-inscripción" description="Los usuarios pueden inscribirse solos" color="success" />
        </div>
        <template #footer>
          <div class="flex items-center gap-2">
            <ConfirmDelete v-if="course" :action="remove" label="" message="¿Eliminar este curso? Se perderán sus lecciones, preguntas e inscripciones." />
            <DuiButton type="submit" color="primary" class="ml-auto" :loading="saving">
              <i class="mdi mdi-content-save-outline mr-1" /> Guardar
            </DuiButton>
          </div>
        </template>
      </DuiCard>
    </div>
  </DuiForm>
</template>
