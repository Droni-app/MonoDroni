<script setup lang="ts">
import { ref, watch } from 'vue'
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
        <DuiTextarea v-model="form.description" block :autoheight="true" placeholder="Descripción breve" />
      </DuiLabel>

      <DuiLabel title="Contenido">
        <DuiTextarea v-model="form.content" block rows="14" placeholder="Contenido de la lección" />
      </DuiLabel>

      <DuiLabel title="Actividad (opcional)">
        <DuiTextarea
          v-model="form.activity"
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
            <DuiInput v-model="form.limit_date" block type="datetime-local" />
          </DuiLabel>
        </div>

        <DuiLabel title="Video">
          <DuiInput v-model="form.video" block placeholder="URL del video de la lección" />
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
