<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { DuiTable, DuiButton, DuiBadge } from '@dronico/droni-kit'
import { useFetchItem } from '../../../../../composables/useFetchItem'
import { usePaginatedList } from '../../../../../composables/usePaginatedList'
import { formatDate } from '../../../../../utils/format'
import PageHeader from '../../../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../../../components/ui/StatusBadge.vue'
import EmptyState from '../../../../../components/ui/EmptyState.vue'
import type { LearnCourse, LearnLesson } from '../../../../../types/AppiService'

const courseId = useRoute().params.courseId as string
const { item: course } = useFetchItem<LearnCourse>(`/admin/learn/courses/${courseId}`)
const { rows, loading, tablePagination, fetch } = usePaginatedList<LearnLesson>(`/admin/learn/courses/${courseId}/lessons`)

const columns = [
  { label: '#', name: 'order' },
  { label: 'Lección', name: 'name' },
  { label: 'Formato', name: 'format' },
  { label: 'Fecha límite', name: 'limitDate' },
  { label: 'Estado', name: 'active' },
  { label: '', name: 'actions', classes: 'text-right' },
]

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Lecciones" :subtitle="course?.name" :back="`/learn/courses/${courseId}`">
    <DuiButton variant="outline" :to="`/learn/courses/${courseId}/questions`">
      <i class="mdi mdi-help-circle-outline mr-1" /> Banco de preguntas
    </DuiButton>
    <DuiButton color="primary" :to="`/learn/courses/${courseId}/lessons/create`">
      <i class="mdi mdi-plus mr-1" /> Nueva lección
    </DuiButton>
  </PageHeader>

  <DuiTable :columns="columns" :rows="rows" :loading="loading" :pagination="tablePagination" @paginate="fetch">
    <template #order="{ order }"><span class="font-mono text-slate-400">{{ order }}</span></template>
    <template #name="{ id, name, activity }">
      <RouterLink :to="`/learn/courses/${courseId}/lessons/${id}`" class="font-medium hover:underline">{{ name }}</RouterLink>
      <DuiBadge v-if="activity" label="con actividad" size="xs" color="secondary" class="ml-2" />
    </template>
    <template #format="{ format }"><DuiBadge :label="format" size="xs" /></template>
    <template #limitDate="{ limitDate }">{{ formatDate(limitDate) }}</template>
    <template #active="{ active }">
      <StatusBadge :status="active" on="Publicada" off="Borrador" />
    </template>
    <template #actions="{ id }">
      <div class="flex justify-end">
        <DuiButton variant="ghost" size="sm" title="Editar" :to="`/learn/courses/${courseId}/lessons/${id}`">
          <i class="mdi mdi-pencil" />
        </DuiButton>
      </div>
    </template>
  </DuiTable>
  <EmptyState v-if="!loading && !rows.length" icon="mdi-book-open-page-variant-outline" text="Este curso aún no tiene lecciones." />
</template>
