<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DuiButton, DuiInput, DuiLabel, DuiTextarea, DuiAlert } from '@dronico/droni-kit'
import AttachmentInput from '../AttachmentInput.vue'
import type { LearnQuestionFormData } from '../../types/AppiService'

const props = withDefaults(
  defineProps<{
    initialValue?: Partial<LearnQuestionFormData>
    loading?: boolean
    error?: string | null
    deletable?: boolean
    courseId?: string
  }>(),
  {
    loading: false,
    error: null,
    deletable: false,
  }
)

const emit = defineEmits<{
  submit: [data: LearnQuestionFormData]
  delete: []
}>()

const form = ref<LearnQuestionFormData>({
  name: '',
  description: null,
  picture: null,
  attachment: null,
  response_1: '',
  response_2: '',
  response_3: null,
  response_4: null,
  response_5: null,
  response_correct: 1,
})

watch(
  () => props.initialValue,
  (val) => {
    if (!val) return
    form.value = {
      name: val.name ?? '',
      description: val.description ?? null,
      picture: val.picture ?? null,
      attachment: val.attachment ?? null,
      response_1: val.response_1 ?? '',
      response_2: val.response_2 ?? '',
      response_3: val.response_3 ?? null,
      response_4: val.response_4 ?? null,
      response_5: val.response_5 ?? null,
      response_correct: val.response_correct ?? 1,
    }
  },
  { immediate: true }
)

function handleSubmit() {
  emit('submit', { ...form.value })
}

// DuiInput/DuiTextarea don't accept `null`, but the wire format does (to clear a field) —
// these bridge the two only at the template binding, the underlying form stays `| null`.
const descriptionModel = computed({
  get: () => form.value.description ?? undefined,
  set: (value: string | undefined) => {
    form.value.description = value ?? null
  },
})
const response3Model = computed({
  get: () => form.value.response_3 ?? undefined,
  set: (value: string | undefined) => {
    form.value.response_3 = value ?? null
  },
})
const response4Model = computed({
  get: () => form.value.response_4 ?? undefined,
  set: (value: string | undefined) => {
    form.value.response_4 = value ?? null
  },
})
const response5Model = computed({
  get: () => form.value.response_5 ?? undefined,
  set: (value: string | undefined) => {
    form.value.response_5 = value ?? null
  },
})
</script>

<template>
  <form class="flex flex-col gap-4 max-w-xl" @submit.prevent="handleSubmit">
    <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>

    <DuiLabel title="Pregunta">
      <DuiInput v-model="form.name" block placeholder="Enunciado de la pregunta" required />
    </DuiLabel>

    <DuiLabel title="Descripción">
      <DuiTextarea v-model="descriptionModel" block :autoheight="true" placeholder="Contexto adicional (opcional)" />
    </DuiLabel>

    <DuiLabel title="Imagen">
      <AttachmentInput v-model="form.picture" placeholder="URL de la imagen (opcional)" />
    </DuiLabel>

    <DuiLabel title="Adjunto">
      <AttachmentInput v-model="form.attachment" placeholder="URL de un archivo adjunto (opcional)" />
    </DuiLabel>

    <p class="text-xs font-medium text-slate-600 dark:text-slate-400">
      Marca con el radio cuál es la respuesta correcta. Las respuestas 3, 4 y 5 son opcionales.
    </p>

    <DuiLabel title="Respuesta 1 *">
      <div class="flex items-center gap-2">
        <input type="radio" :checked="form.response_correct === 1" name="response_correct" @change="form.response_correct = 1" />
        <DuiInput v-model="form.response_1" block required placeholder="Opción 1" />
      </div>
    </DuiLabel>
    <DuiLabel title="Respuesta 2 *">
      <div class="flex items-center gap-2">
        <input type="radio" :checked="form.response_correct === 2" name="response_correct" @change="form.response_correct = 2" />
        <DuiInput v-model="form.response_2" block required placeholder="Opción 2" />
      </div>
    </DuiLabel>
    <DuiLabel title="Respuesta 3">
      <div class="flex items-center gap-2">
        <input type="radio" :checked="form.response_correct === 3" name="response_correct" @change="form.response_correct = 3" />
        <DuiInput v-model="response3Model" block placeholder="Opción 3" />
      </div>
    </DuiLabel>
    <DuiLabel title="Respuesta 4">
      <div class="flex items-center gap-2">
        <input type="radio" :checked="form.response_correct === 4" name="response_correct" @change="form.response_correct = 4" />
        <DuiInput v-model="response4Model" block placeholder="Opción 4" />
      </div>
    </DuiLabel>
    <DuiLabel title="Respuesta 5">
      <div class="flex items-center gap-2">
        <input type="radio" :checked="form.response_correct === 5" name="response_correct" @change="form.response_correct = 5" />
        <DuiInput v-model="response5Model" block placeholder="Opción 5" />
      </div>
    </DuiLabel>

    <div class="flex gap-3 mt-2">
      <DuiButton v-if="deletable" type="button" color="danger" @click="emit('delete')">
        <i class="mdi mdi-delete" />
      </DuiButton>
      <div class="flex gap-3 justify-end flex-1">
        <RouterLink :to="`/learn/courses/${courseId}/questions`">
          <DuiButton type="button" color="neutral">Cancelar</DuiButton>
        </RouterLink>
        <DuiButton type="submit" color="primary" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </DuiButton>
      </div>
    </div>
  </form>
</template>
