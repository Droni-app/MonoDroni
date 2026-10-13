<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { DuiTable, DuiButton } from '@dronico/droni-kit'
import { useFetchItem } from '../../../../../composables/useFetchItem'
import { usePaginatedList } from '../../../../../composables/usePaginatedList'
import PageHeader from '../../../../../components/ui/PageHeader.vue'
import EmptyState from '../../../../../components/ui/EmptyState.vue'
import type { LearnCourse, LearnQuestion } from '../../../../../types/AppiService'

const courseId = useRoute().params.courseId as string
const { item: course } = useFetchItem<LearnCourse>(`/admin/learn/courses/${courseId}`)
const { rows, loading, tablePagination, fetch } = usePaginatedList<LearnQuestion>(`/admin/learn/courses/${courseId}/questions`)

const columns = [
  { label: 'Pregunta', name: 'name' },
  { label: 'Aciertos', name: 'wons' },
  { label: 'Fallos', name: 'losses' },
  { label: 'Dificultad', name: 'difficulty' },
  { label: '', name: 'actions', classes: 'text-right' },
]

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Banco de preguntas" :subtitle="course?.name" :back="`/learn/courses/${courseId}`">
    <DuiButton variant="outline" :to="`/learn/courses/${courseId}/lessons`">
      <i class="mdi mdi-book-open-page-variant-outline mr-1" /> Lecciones
    </DuiButton>
    <DuiButton color="primary" :to="`/learn/courses/${courseId}/questions/create`">
      <i class="mdi mdi-plus mr-1" /> Nueva pregunta
    </DuiButton>
  </PageHeader>

  <DuiTable :columns="columns" :rows="rows" :loading="loading" :pagination="tablePagination" @paginate="fetch">
    <template #name="{ id, name }">
      <RouterLink :to="`/learn/courses/${courseId}/questions/${id}`" class="font-medium hover:underline">{{ name }}</RouterLink>
    </template>
    <template #wons="{ wons }"><span class="text-green-600">{{ wons }}</span></template>
    <template #losses="{ losses }"><span class="text-red-500">{{ losses }}</span></template>
    <template #difficulty="{ difficulty }">
      <div class="flex items-center gap-2">
        <div class="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div class="h-full bg-amber-500" :style="{ width: `${Number(difficulty)}%` }" />
        </div>
        <span class="text-xs">{{ Number(difficulty).toFixed(0) }}%</span>
      </div>
    </template>
    <template #actions="{ id }">
      <div class="flex justify-end">
        <DuiButton variant="ghost" size="sm" title="Editar" :to="`/learn/courses/${courseId}/questions/${id}`">
          <i class="mdi mdi-pencil" />
        </DuiButton>
      </div>
    </template>
  </DuiTable>
  <EmptyState v-if="!loading && !rows.length" icon="mdi-help-circle-outline" text="El banco de preguntas está vacío." />
</template>
