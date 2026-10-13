<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton, DuiInput, DuiBadge } from '@dronico/droni-kit'
import { usePaginatedList } from '../../../composables/usePaginatedList'
import { formatDate } from '../../../utils/format'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../components/ui/StatusBadge.vue'
import EmptyState from '../../../components/ui/EmptyState.vue'
import type { LearnCourse } from '../../../types/AppiService'

const columns = [
  { label: 'Curso', name: 'name' },
  { label: 'Grupo', name: 'group' },
  { label: 'Auto-inscripción', name: 'autoEnroll' },
  { label: 'Estado', name: 'active' },
  { label: 'Creado', name: 'createdAt' },
  { label: '', name: 'actions', classes: 'text-right' },
]

const q = ref('')
const group = ref('')
const { rows, loading, tablePagination, fetch } = usePaginatedList<LearnCourse>(
  '/admin/learn/courses',
  () => ({ q: q.value.trim(), group: group.value.trim() })
)

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Cursos" subtitle="Cursos, lecciones y bancos de preguntas">
    <DuiButton color="primary" to="/learn/courses/create">
      <i class="mdi mdi-plus mr-1" /> Nuevo curso
    </DuiButton>
  </PageHeader>

  <form class="mb-4 grid max-w-2xl gap-2 sm:grid-cols-3" @submit.prevent="fetch(1)">
    <DuiInput v-model="q" block placeholder="Buscar cursos..." class="sm:col-span-2" />
    <DuiInput v-model="group" block placeholder="Grupo" />
    <button type="submit" class="hidden" />
  </form>

  <DuiTable :columns="columns" :rows="rows" :loading="loading" :pagination="tablePagination" @paginate="fetch">
    <template #name="{ id, name, slug }">
      <RouterLink :to="`/learn/courses/${id}`" class="font-medium hover:underline">{{ name }}</RouterLink>
      <p class="text-xs text-slate-400">{{ slug }}</p>
    </template>
    <template #group="{ group }">
      <DuiBadge v-if="group" :label="group" size="xs" color="primary" />
      <span v-else class="text-slate-400">—</span>
    </template>
    <template #autoEnroll="{ autoEnroll }">
      <StatusBadge :status="autoEnroll" on="Sí" off="No" />
    </template>
    <template #active="{ active }">
      <StatusBadge :status="active" />
    </template>
    <template #createdAt="{ createdAt }">{{ formatDate(createdAt) }}</template>
    <template #actions="{ id }">
      <div class="flex justify-end gap-1">
        <DuiButton variant="ghost" size="sm" title="Lecciones" :to="`/learn/courses/${id}/lessons`">
          <i class="mdi mdi-book-open-page-variant-outline" />
        </DuiButton>
        <DuiButton variant="ghost" size="sm" title="Banco de preguntas" :to="`/learn/courses/${id}/questions`">
          <i class="mdi mdi-help-circle-outline" />
        </DuiButton>
        <DuiButton variant="ghost" size="sm" title="Editar" :to="`/learn/courses/${id}`">
          <i class="mdi mdi-pencil" />
        </DuiButton>
      </div>
    </template>
  </DuiTable>
  <EmptyState v-if="!loading && !rows.length" icon="mdi-school-outline" text="No hay cursos." />
</template>
