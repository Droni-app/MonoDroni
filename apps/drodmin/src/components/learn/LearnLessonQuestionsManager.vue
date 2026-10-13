<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DuiButton, DuiSelect, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../services/AppiService'
import EmptyState from '../ui/EmptyState.vue'
import type { LearnLessonQuestion, LearnQuestion, PaginatedResponse } from '../../types/AppiService'

// Questions from the course bank that make up this lesson's exam.
const props = defineProps<{ courseId: string; lessonId: string }>()

const toast = useToast()
const url = `/admin/learn/courses/${props.courseId}/lessons/${props.lessonId}/exam-questions`
const linked = ref<LearnLessonQuestion[]>([])
const bank = ref<LearnQuestion[]>([])
const loading = ref(false)
const linking = ref(false)
const selectedId = ref('')

const available = computed(() => {
  const linkedIds = new Set(linked.value.map((l) => l.questionId))
  return bank.value.filter((q) => !linkedIds.has(q.id))
})

async function fetchAll() {
  loading.value = true
  try {
    const [linkedRes, bankRes] = await Promise.all([
      AppiService.get<LearnLessonQuestion[]>(url),
      AppiService.get<PaginatedResponse<LearnQuestion>>(`/admin/learn/courses/${props.courseId}/questions`, { params: { per_page: 200 } }),
    ])
    linked.value = linkedRes.data
    bank.value = bankRes.data.data
  } catch (e) {
    toast.error(apiError(e, 'Error al cargar las preguntas.'))
  } finally {
    loading.value = false
  }
}

async function link() {
  linking.value = true
  try {
    const { data } = await AppiService.post<LearnLessonQuestion>(url, { question_id: selectedId.value })
    linked.value.push({ ...data, question: bank.value.find((q) => q.id === selectedId.value) })
    selectedId.value = ''
  } catch (e) {
    toast.error(apiError(e, 'Error al vincular la pregunta.'))
  } finally {
    linking.value = false
  }
}

async function unlink(id: string) {
  try {
    await AppiService.delete(`${url}/${id}`)
    linked.value = linked.value.filter((l) => l.id !== id)
  } catch (e) {
    toast.error(apiError(e, 'Error al quitar la pregunta.'))
  }
}

onMounted(fetchAll)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2 sm:flex-row">
      <DuiSelect
        v-model="selectedId"
        :options="available"
        item-label="name"
        item-value="id"
        placeholder="Elige una pregunta del banco del curso"
        block
        class="flex-1"
      />
      <DuiButton color="primary" :loading="linking" :disabled="!selectedId" @click="link">
        <i class="mdi mdi-link-variant mr-1" /> Agregar al examen
      </DuiButton>
    </div>

    <p v-if="loading" class="text-sm text-slate-500">Cargando...</p>
    <EmptyState v-else-if="!linked.length" icon="mdi-help-circle-outline" text="El examen de esta lección no tiene preguntas." />
    <ol v-else class="divide-y divide-slate-200 dark:divide-slate-700">
      <li v-for="(item, index) in linked" :key="item.id" class="flex items-center gap-3 py-2">
        <span class="w-6 text-right font-mono text-sm text-slate-400">{{ index + 1 }}.</span>
        <RouterLink :to="`/learn/courses/${courseId}/questions/${item.questionId}`" class="flex-1 truncate text-sm hover:underline">
          {{ item.question?.name ?? item.questionId }}
        </RouterLink>
        <DuiButton variant="ghost" color="danger" size="sm" title="Quitar del examen" @click="unlink(item.id)">
          <i class="mdi mdi-link-variant-off" />
        </DuiButton>
      </li>
    </ol>
  </div>
</template>
