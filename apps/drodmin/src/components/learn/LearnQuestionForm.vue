<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiCard, DuiForm, DuiInput, DuiTextarea, DuiButton, DuiLabel, DuiRadio, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../services/AppiService'
import { emptyToNull } from '../../utils/format'
import AttachmentInput from '../AttachmentInput.vue'
import ConfirmDelete from '../ui/ConfirmDelete.vue'
import type { LearnQuestion } from '../../types/AppiService'

// Creates a question in the course bank when `question` is missing, edits it otherwise.
const props = defineProps<{ courseId: string; question?: LearnQuestion }>()

const router = useRouter()
const toast = useToast()
const saving = ref(false)
const q = props.question
const baseUrl = `/admin/learn/courses/${props.courseId}/questions`
const listUrl = `/learn/courses/${props.courseId}/questions`

const form = reactive({
  name: q?.name ?? '',
  description: q?.description ?? '',
  picture: q?.picture ?? null,
  attachment: q?.attachment ?? null,
  response_1: q?.response1 ?? '',
  response_2: q?.response2 ?? '',
  response_3: q?.response3 ?? '',
  response_4: q?.response4 ?? '',
  response_5: q?.response5 ?? '',
  response_correct: String(q?.responseCorrect ?? 1),
})

// Answers 1 and 2 are required, 3-5 optional.
const responseKeys = ['response_1', 'response_2', 'response_3', 'response_4', 'response_5'] as const

// Only answers with text can be marked as the correct one.
const correctOptions = computed(() =>
  responseKeys
    .map((key, i) => ({ value: String(i + 1), label: form[key] || `Respuesta ${i + 1}`, disabled: !form[key] }))
)

async function save() {
  saving.value = true
  try {
    const payload = emptyToNull({ ...form, response_correct: Number(form.response_correct) })
    if (q) {
      await AppiService.patch(`${baseUrl}/${q.id}`, payload)
      toast.success('Pregunta guardada.')
    } else {
      await AppiService.post(baseUrl, payload)
      toast.success('Pregunta creada.')
    }
    router.push(listUrl)
  } catch (e) {
    toast.error(apiError(e, 'Error al guardar la pregunta.'))
  } finally {
    saving.value = false
  }
}

async function remove() {
  try {
    await AppiService.delete(`${baseUrl}/${q!.id}`)
    toast.success('Pregunta eliminada.')
    router.push(listUrl)
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar la pregunta.'))
  }
}
</script>

<template>
  <DuiForm :loading="saving" @submit="save">
    <div class="grid items-start gap-6 lg:grid-cols-3">
      <div class="flex flex-col gap-6 lg:col-span-2">
        <DuiCard title="Pregunta">
          <div class="flex flex-col gap-4">
            <DuiLabel title="Enunciado" required>
              <DuiInput v-model="form.name" block placeholder="¿Cuál es...?" required />
            </DuiLabel>
            <DuiLabel title="Contexto">
              <DuiTextarea v-model="form.description" block autoheight placeholder="Información adicional (opcional)" />
            </DuiLabel>
          </div>
        </DuiCard>

        <DuiCard title="Opciones de respuesta" subtitle="Las opciones 1 y 2 son obligatorias">
          <div class="flex flex-col gap-3">
            <DuiLabel v-for="(key, i) in responseKeys" :key="key" :title="`Opción ${i + 1}`" :required="i < 2">
              <DuiInput v-model="form[key]" block :required="i < 2" />
            </DuiLabel>
          </div>
        </DuiCard>
      </div>

      <DuiCard>
        <div class="flex flex-col gap-4">
          <DuiRadio v-model="form.response_correct" :options="correctOptions" group-label="Respuesta correcta" color="success" />
          <DuiLabel title="Imagen">
            <AttachmentInput v-model="form.picture" />
          </DuiLabel>
          <DuiLabel title="Archivo adjunto">
            <AttachmentInput v-model="form.attachment" />
          </DuiLabel>
          <dl v-if="question" class="grid grid-cols-3 gap-2 rounded-lg bg-slate-500/10 p-3 text-center text-sm">
            <div><dt class="text-xs text-slate-500">Aciertos</dt><dd class="font-semibold">{{ question.wons }}</dd></div>
            <div><dt class="text-xs text-slate-500">Fallos</dt><dd class="font-semibold">{{ question.losses }}</dd></div>
            <div><dt class="text-xs text-slate-500">Dificultad</dt><dd class="font-semibold">{{ Number(question.difficulty).toFixed(0) }}%</dd></div>
          </dl>
        </div>
        <template #footer>
          <div class="flex items-center gap-2">
            <ConfirmDelete v-if="question" :action="remove" label="" />
            <DuiButton type="submit" color="primary" class="ml-auto" :loading="saving">
              <i class="mdi mdi-content-save-outline mr-1" /> Guardar
            </DuiButton>
          </div>
        </template>
      </DuiCard>
    </div>
  </DuiForm>
</template>
