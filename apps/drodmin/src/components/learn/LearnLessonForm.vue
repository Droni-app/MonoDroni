<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiCard, DuiForm, DuiInput, DuiTextarea, DuiButton, DuiLabel, DuiSelect, DuiSwitch, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../services/AppiService'
import { emptyToNull, toDateTimeInput } from '../../utils/format'
import MonacoEditor from '../MonacoEditor.vue'
import ConfirmDelete from '../ui/ConfirmDelete.vue'
import type { LearnLesson } from '../../types/AppiService'

// Creates a lesson in `courseId` when `lesson` is missing, edits it otherwise.
const props = defineProps<{ courseId: string; lesson?: LearnLesson }>()

const router = useRouter()
const toast = useToast()
const saving = ref(false)
const l = props.lesson
const baseUrl = `/admin/learn/courses/${props.courseId}/lessons`

const form = reactive({
  name: l?.name ?? '',
  description: l?.description ?? '',
  format: l?.format ?? 'markdown',
  content: l?.content ?? '',
  activity: l?.activity ?? '',
  video: l?.video ?? '',
  order: l?.order ?? 0,
  active: l ? !!l.active : false,
  limit_date: toDateTimeInput(l?.limitDate),
})

const formatOptions = [
  { label: 'Markdown', value: 'markdown' },
  { label: 'HTML', value: 'html' },
  { label: 'Texto plano', value: 'text' },
]

async function save() {
  saving.value = true
  try {
    const payload = emptyToNull({ ...form })
    if (l) {
      await AppiService.patch(`${baseUrl}/${l.id}`, payload)
      toast.success('Lección guardada.')
    } else {
      const { data } = await AppiService.post<LearnLesson>(baseUrl, payload)
      toast.success('Lección creada.')
      router.push(`/learn/courses/${props.courseId}/lessons/${data.id}`)
    }
  } catch (e) {
    toast.error(apiError(e, 'Error al guardar la lección.'))
  } finally {
    saving.value = false
  }
}

async function remove() {
  try {
    await AppiService.delete(`${baseUrl}/${l!.id}`)
    toast.success('Lección eliminada.')
    router.push(`/learn/courses/${props.courseId}/lessons`)
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar la lección.'))
  }
}
</script>

<template>
  <DuiForm :loading="saving" @submit="save">
    <div class="grid items-start gap-6 lg:grid-cols-3">
      <DuiCard class="lg:col-span-2">
        <div class="flex flex-col gap-4">
          <DuiLabel title="Nombre" required>
            <DuiInput v-model="form.name" block placeholder="Nombre de la lección" required />
          </DuiLabel>
          <DuiLabel title="Descripción">
            <DuiTextarea v-model="form.description" block autoheight placeholder="Resumen breve" />
          </DuiLabel>
          <div>
            <p class="mb-1.5 font-medium text-zinc-700 dark:text-zinc-200">Contenido</p>
            <div class="h-[50vh] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
              <MonacoEditor v-model="form.content" :language="form.format" />
            </div>
          </div>
          <DuiLabel title="Actividad" help-text="Consigna que el estudiante debe responder. Vacío = sin actividad.">
            <DuiTextarea v-model="form.activity" block rows="4" placeholder="Opcional" />
          </DuiLabel>
        </div>
      </DuiCard>

      <DuiCard>
        <div class="flex flex-col gap-4">
          <DuiLabel title="Formato del contenido">
            <DuiSelect v-model="form.format" :options="formatOptions" item-label="label" item-value="value" block />
          </DuiLabel>
          <div class="grid grid-cols-2 gap-4">
            <DuiLabel title="Orden">
              <DuiInput v-model.number="form.order" block type="number" min="0" />
            </DuiLabel>
            <DuiLabel title="Fecha límite">
              <DuiInput v-model="form.limit_date" block type="datetime-local" />
            </DuiLabel>
          </div>
          <DuiLabel title="Video">
            <DuiInput v-model="form.video" block placeholder="https://youtube.com/..." />
          </DuiLabel>
          <DuiSwitch v-model="form.active" label="Lección publicada" color="success" />
        </div>
        <template #footer>
          <div class="flex items-center gap-2">
            <ConfirmDelete v-if="lesson" :action="remove" label="" />
            <DuiButton type="submit" color="primary" class="ml-auto" :loading="saving">
              <i class="mdi mdi-content-save-outline mr-1" /> Guardar
            </DuiButton>
          </div>
        </template>
      </DuiCard>
    </div>
  </DuiForm>
</template>
