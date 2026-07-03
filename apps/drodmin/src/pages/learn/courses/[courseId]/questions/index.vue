<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { DuiTable, DuiButton } from '@dronico/droni-kit'
import AppiService from '../../../../../services/AppiService'
import type { LearnQuestion, PaginatedResponse, PaginationMeta } from '../../../../../types/AppiService'

const route = useRoute()
const courseId = route.params.courseId as string

const columns = [
  { label: 'Pregunta', name: 'name' },
  { label: 'Aciertos', name: 'wons' },
  { label: 'Fallos', name: 'losses' },
  { label: 'Dificultad', name: 'difficulty' },
  { label: '', name: 'actions' },
]

const rows = ref<LearnQuestion[]>([])
const loading = ref(false)
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })

async function fetchQuestions(page = 1) {
  loading.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<LearnQuestion>>(
      `/admin/learn/courses/${courseId}/questions`,
      { params: { page } }
    )
    rows.value = data.data
    meta.value = { total: data.meta.total, perPage: data.meta.perPage, currentPage: data.meta.currentPage }
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchQuestions())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <RouterLink to="/learn/courses" class="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          <i class="mdi mdi-arrow-left mr-1" />Cursos
        </RouterLink>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Banco de preguntas</h1>
      </div>
      <RouterLink :to="`/learn/courses/${courseId}/questions/create`">
        <DuiButton color="primary" size="sm">
          <i class="mdi mdi-plus mr-1" /> Nueva pregunta
        </DuiButton>
      </RouterLink>
    </div>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchQuestions"
    >
      <template #difficulty="{ difficulty }">
        {{ Number(difficulty).toFixed(0) }}%
      </template>
      <template #actions="{ id }">
        <RouterLink :to="`/learn/courses/${courseId}/questions/${id}`">
          <DuiButton size="sm" color="secondary">
            <i class="mdi mdi-pencil" />
          </DuiButton>
        </RouterLink>
      </template>
    </DuiTable>
  </div>
</template>
