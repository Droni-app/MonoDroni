<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { LearnEnrollment, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const columns = [
  { label: 'Usuario', name: 'user' },
  { label: 'Curso', name: 'course' },
  { label: 'Rol', name: 'role' },
  { label: 'Estado', name: 'status' },
  { label: 'Progreso', name: 'progress' },
  { label: '', name: 'actions' },
]

const rows = ref<LearnEnrollment[]>([])
const loading = ref(false)
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })

async function fetchEnrollments(page = 1) {
  loading.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<LearnEnrollment>>('/admin/learn/enrollments', {
      params: { page },
    })
    rows.value = data.data
    meta.value = { total: data.meta.total, perPage: data.meta.perPage, currentPage: data.meta.currentPage }
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchEnrollments())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Inscripciones</h1>
      <RouterLink to="/learn/enrollments/create">
        <DuiButton color="primary" size="sm">
          <i class="mdi mdi-plus mr-1" /> Inscribir usuario
        </DuiButton>
      </RouterLink>
    </div>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchEnrollments"
    >
      <template #user="{ user }">
        {{ user?.fullName ?? '—' }}
      </template>
      <template #course="{ course }">
        {{ course?.name ?? '—' }}
      </template>
      <template #progress="{ progress }">
        {{ Number(progress).toFixed(0) }}%
      </template>
      <template #actions="{ id }">
        <RouterLink :to="`/learn/enrollments/${id}`">
          <DuiButton size="sm" color="secondary">
            <i class="mdi mdi-pencil" />
          </DuiButton>
        </RouterLink>
      </template>
    </DuiTable>
  </div>
</template>
