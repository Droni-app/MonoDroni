<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DuiButton, DuiInput, DuiLabel, DuiTextarea, DuiCheckbox, DuiAlert, DuiSelect, DuiTabs } from '@dronico/droni-kit'
import LearnLessonQuestionsManager from './LearnLessonQuestionsManager.vue'
import LearnLessonAnswersManager from './LearnLessonAnswersManager.vue'
import LearnLessonQuizzesManager from './LearnLessonQuizzesManager.vue'
import type { LearnLessonFormData } from '../../types/AppiService'

const props = withDefaults(
  defineProps<{
    initialValue?: Partial<LearnLessonFormData>
    loading?: boolean
    error?: string | null
    deletable?: boolean
    courseId?: string
    lessonId?: string
  }>(),
  {
    loading: false,
    error: null,
    deletable: false,
  }
)

const emit = defineEmits<{
  submit: [data: LearnLessonFormData]
  delete: []
}>()

const form = ref<LearnLessonFormData>({
  name: '',
  description: null,
  format: 'markdown',
  content: null,
  activity: null,
  video: null,
  order: 0,
  active: false,
  limit_date: null,
})

const formatOptions = [
  { label: 'Markdown', value: 'markdown' },
  { label: 'HTML', value: 'html' },
  { label: 'Texto plano', value: 'text' },
]

watch(
  () => props.initialValue,
  (val) => {
    if (!val) return
    form.value = {
      name: val.name ?? '',
      description: val.description ?? null,
      format: val.format ?? 'markdown',
      content: val.content ?? null,
      activity: val.activity ?? null,
      video: val.video ?? null,
      order: val.order ?? 0,
      active: val.active ?? false,
      limit_date: val.limit_date ?? null,
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
const contentModel = computed({
  get: () => form.value.content ?? undefined,
  set: (value: string | undefined) => {
    form.value.content = value ?? null
  },
})
const activityModel = computed({
  get: () => form.value.activity ?? undefined,
  set: (value: string | undefined) => {
    form.value.activity = value ?? null
  },
})
const videoModel = computed({
  get: () => form.value.video ?? undefined,
  set: (value: string | undefined) => {
    form.value.video = value ?? null
  },
})
const limitDateModel = computed({
  get: () => form.value.limit_date ?? undefined,
  set: (value: string | undefined) => {
    form.value.limit_date = value ?? null
  },
})

const activeTab = ref<'general' | 'preguntas' | 'respuestas' | 'quizzes'>('general')
const tabs = [
  { value: 'general', label: 'General' },
  { value: 'preguntas', label: 'Preguntas' },
  { value: 'respuestas', label: 'Respuestas' },
  { value: 'quizzes', label: 'Quizzes' },
]
</script>

<template>
  <form class="flex gap-6 h-[calc(100vh-160px)]" @submit.prevent="handleSubmit">
    <div class="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto pr-1">
      <DuiLabel title="Nombre">
        <DuiInput v-model="form.name" block placeholder="Nombre de la lección" required />
      </DuiLabel>

      <DuiLabel title="Descripción">
        <DuiTextarea v-model="descriptionModel" block :autoheight="true" placeholder="Descripción breve" />
      </DuiLabel>

      <DuiLabel title="Contenido">
        <DuiTextarea v-model="contentModel" block rows="14" placeholder="Contenido de la lección" />
      </DuiLabel>

      <DuiLabel title="Actividad (opcional)">
        <DuiTextarea
          v-model="activityModel"
          block
          rows="6"
          placeholder="Consigna de la actividad que el estudiante debe responder. Déjalo vacío si la lección no tiene actividad."
        />
      </DuiLabel>
    </div>

    <div class="w-80 flex flex-col gap-4 overflow-y-auto shrink-0">
      <DuiTabs v-if="lessonId" v-model="activeTab" :tabs="tabs" />

      <template v-if="!lessonId || activeTab === 'general'">
        <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>

        <DuiLabel title="Formato">
          <DuiSelect v-model="form.format" :options="formatOptions" item-label="label" item-value="value" block />
        </DuiLabel>

        <div class="grid grid-cols-2 gap-3">
          <DuiLabel title="Orden">
            <DuiInput v-model.number="form.order" block type="number" min="0" />
          </DuiLabel>
          <DuiLabel title="Fecha límite">
            <DuiInput v-model="limitDateModel" block type="datetime-local" />
          </DuiLabel>
        </div>

        <DuiLabel title="Video">
          <DuiInput v-model="videoModel" block placeholder="URL del video de la lección" />
        </DuiLabel>

        <div>
          <DuiCheckbox v-model="form.active" label="Activa" color="primary" />
        </div>

        <div class="flex gap-3 mt-auto pt-4">
          <DuiButton v-if="deletable" type="button" color="danger" @click="emit('delete')">
            <i class="mdi mdi-delete" />
          </DuiButton>
          <div class="flex gap-3 justify-end flex-1">
            <RouterLink :to="`/learn/courses/${courseId}/lessons`">
              <DuiButton type="button" color="neutral">Cancelar</DuiButton>
            </RouterLink>
            <DuiButton type="submit" color="primary" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </DuiButton>
          </div>
        </div>
      </template>

      <LearnLessonQuestionsManager
        v-if="lessonId && courseId && activeTab === 'preguntas'"
        :course-id="courseId"
        :lesson-id="lessonId"
      />
      <LearnLessonAnswersManager
        v-if="lessonId && courseId && activeTab === 'respuestas'"
        :course-id="courseId"
        :lesson-id="lessonId"
      />
      <LearnLessonQuizzesManager
        v-if="lessonId && courseId && activeTab === 'quizzes'"
        :course-id="courseId"
        :lesson-id="lessonId"
      />
    </div>
  </form>
</template>
