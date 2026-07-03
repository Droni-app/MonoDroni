<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton, DuiInput } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { LearnCourse, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const columns = [
  { label: 'Nombre', name: 'name' },
  { label: 'Grupo', name: 'group' },
  { label: 'Auto-inscripción', name: 'autoEnroll' },
  { label: 'Activo', name: 'active' },
  { label: 'Creado', name: 'createdAt' },
  { label: '', name: 'actions' },
]

const rows = ref<LearnCourse[]>([])
const loading = ref(false)
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })
const searchQuery = ref('')

async function fetchCourses(page = 1) {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page }
    if (searchQuery.value.trim()) params.q = searchQuery.value.trim()
    const { data } = await AppiService.get<PaginatedResponse<LearnCourse>>('/admin/learn/courses', { params })
    rows.value = data.data
    meta.value = { total: data.meta.total, perPage: data.meta.perPage, currentPage: data.meta.currentPage }
  } finally {
    loading.value = false
  }
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') fetchCourses(1)
}

onMounted(() => fetchCourses())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Cursos</h1>
      <RouterLink to="/learn/courses/create">
        <DuiButton color="primary" size="sm">
          <i class="mdi mdi-plus mr-1" /> Nuevo curso
        </DuiButton>
      </RouterLink>
    </div>
    <div class="mb-4">
      <DuiInput v-model="searchQuery" placeholder="Buscar cursos... (Enter para buscar)" @keydown="onSearchKeydown" />
    </div>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchCourses"
    >
      <template #group="{ group }">
        {{ group || '—' }}
      </template>
      <template #autoEnroll="{ autoEnroll }">
        <span :class="autoEnroll ? 'text-green-600' : 'text-slate-400'">
          {{ autoEnroll ? 'Sí' : 'No' }}
        </span>
      </template>
      <template #active="{ active }">
        <span :class="active ? 'text-green-600' : 'text-red-500'">
          {{ active ? 'Sí' : 'No' }}
        </span>
      </template>
      <template #createdAt="{ createdAt }">
        {{ new Date(createdAt).toLocaleDateString() }}
      </template>
      <template #actions="{ id }">
        <RouterLink :to="`/learn/courses/${id}`">
          <DuiButton size="sm" color="secondary">
            <i class="mdi mdi-pencil" />
          </DuiButton>
        </RouterLink>
      </template>
    </DuiTable>
  </div>
</template>
