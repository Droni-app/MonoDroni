<script setup lang="ts">
import { ref, watch } from 'vue'
import { DuiButton, DuiInput, DuiLabel, DuiTextarea, DuiCheckbox, DuiAlert } from '@dronico/droni-kit'
import AttachmentInput from '../AttachmentInput.vue'
import type { LearnCourseFormData } from '../../types/AppiService'

const props = withDefaults(
  defineProps<{
    initialValue?: Partial<LearnCourseFormData>
    loading?: boolean
    error?: string | null
    deletable?: boolean
  }>(),
  {
    loading: false,
    error: null,
    deletable: false,
  }
)

const emit = defineEmits<{
  submit: [data: LearnCourseFormData]
  delete: []
}>()

const form = ref<LearnCourseFormData>({
  name: '',
  group: null,
  description: null,
  picture: null,
  video: null,
  auto_enroll: false,
  active: false,
})

watch(
  () => props.initialValue,
  (val) => {
    if (!val) return
    form.value = {
      name: val.name ?? '',
      group: val.group ?? null,
      description: val.description ?? null,
      picture: val.picture ?? null,
      video: val.video ?? null,
      auto_enroll: val.auto_enroll ?? false,
      active: val.active ?? false,
    }
  },
  { immediate: true }
)

function handleSubmit() {
  emit('submit', { ...form.value })
}
</script>

<template>
  <form class="flex flex-col gap-4 max-w-xl" @submit.prevent="handleSubmit">
    <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>

    <DuiLabel title="Nombre">
      <DuiInput v-model="form.name" block placeholder="Nombre del curso" required />
    </DuiLabel>

    <DuiLabel title="Grupo">
      <DuiInput v-model="form.group" block placeholder="Grupo (para filtrar en inscripciones masivas)" />
    </DuiLabel>

    <DuiLabel title="Descripción">
      <DuiTextarea v-model="form.description" block :autoheight="true" placeholder="Descripción del curso" />
    </DuiLabel>

    <DuiLabel title="Imagen">
      <AttachmentInput v-model="form.picture" placeholder="URL de la imagen" />
    </DuiLabel>

    <DuiLabel title="Video">
      <DuiInput v-model="form.video" block placeholder="URL del video de presentación" />
    </DuiLabel>

    <div class="flex flex-col gap-2">
      <DuiCheckbox v-model="form.auto_enroll" label="Auto-inscripción habilitada" color="primary" />
      <DuiCheckbox v-model="form.active" label="Activo" color="primary" />
    </div>

    <div class="flex gap-3 mt-2">
      <DuiButton v-if="deletable" type="button" color="danger" @click="emit('delete')">
        <i class="mdi mdi-delete" />
      </DuiButton>
      <div class="flex gap-3 justify-end flex-1">
        <RouterLink to="/learn/courses">
          <DuiButton type="button" color="neutral">Cancelar</DuiButton>
        </RouterLink>
        <DuiButton type="submit" color="primary" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </DuiButton>
      </div>
    </div>
  </form>
</template>
