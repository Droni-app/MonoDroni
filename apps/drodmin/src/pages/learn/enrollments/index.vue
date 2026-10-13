<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { DuiTable, DuiButton, DuiSelect } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import { usePaginatedList } from '../../../composables/usePaginatedList'
import { formatDate } from '../../../utils/format'
import { ENROLLMENT_ROLES, ENROLLMENT_STATUSES } from '../../../utils/labels'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../components/ui/StatusBadge.vue'
import UserAvatar from '../../../components/ui/UserAvatar.vue'
import EmptyState from '../../../components/ui/EmptyState.vue'
import type { LearnCourse, LearnEnrollment, PaginatedResponse } from '../../../types/AppiService'

const columns = [
  { label: 'Usuario', name: 'user' },
  { label: 'Curso', name: 'course' },
  { label: 'Rol', name: 'role' },
  { label: 'Estado', name: 'status' },
  { label: 'Progreso', name: 'progress' },
  { label: 'Desde', name: 'createdAt' },
  { label: '', name: 'actions', classes: 'text-right' },
]

// `?course_id=` preselects the course filter (linked from the course page)
const filters = ref({ course_id: (useRoute().query.course_id as string) ?? '', role: '', status: '' })
const { rows, loading, tablePagination, fetch } = usePaginatedList<LearnEnrollment>('/admin/learn/enrollments', () => filters.value)

const courses = ref<LearnCourse[]>([])
AppiService.get<PaginatedResponse<LearnCourse>>('/admin/learn/courses', { params: { per_page: 200 } })
  .then(({ data }) => { courses.value = data.data })

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Inscripciones" subtitle="Usuarios inscritos a cursos y su rol">
    <DuiButton color="primary" to="/learn/enrollments/create">
      <i class="mdi mdi-account-plus-outline mr-1" /> Inscribir usuario
    </DuiButton>
  </PageHeader>

  <div class="mb-4 grid gap-2 sm:grid-cols-3">
    <DuiSelect v-model="filters.course_id" :options="courses" item-label="name" item-value="id" placeholder="Todos los cursos" block @update:model-value="fetch(1)" />
    <DuiSelect v-model="filters.role" :options="ENROLLMENT_ROLES" item-label="label" item-value="value" placeholder="Todos los roles" block @update:model-value="fetch(1)" />
    <DuiSelect v-model="filters.status" :options="ENROLLMENT_STATUSES" item-label="label" item-value="value" placeholder="Todos los estados" block @update:model-value="fetch(1)" />
  </div>

  <DuiTable :columns="columns" :rows="rows" :loading="loading" :pagination="tablePagination" @paginate="fetch">
    <template #user="{ id, user }">
      <RouterLink :to="`/learn/enrollments/${id}`" class="hover:underline"><UserAvatar :user="user" /></RouterLink>
    </template>
    <template #course="{ course }">
      <RouterLink v-if="course" :to="`/learn/courses/${course.id}`" class="hover:underline">{{ course.name }}</RouterLink>
    </template>
    <template #role="{ role }"><StatusBadge :status="role" /></template>
    <template #status="{ status }"><StatusBadge :status="status" /></template>
    <template #progress="{ progress }">
      <div class="flex items-center gap-2">
        <div class="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div class="h-full bg-green-500" :style="{ width: `${Number(progress)}%` }" />
        </div>
        <span class="text-xs">{{ Number(progress).toFixed(0) }}%</span>
      </div>
    </template>
    <template #createdAt="{ createdAt }">{{ formatDate(createdAt) }}</template>
    <template #actions="{ id }">
      <div class="flex justify-end">
        <DuiButton variant="ghost" size="sm" title="Editar" :to="`/learn/enrollments/${id}`">
          <i class="mdi mdi-pencil" />
        </DuiButton>
      </div>
    </template>
  </DuiTable>
  <EmptyState v-if="!loading && !rows.length" icon="mdi-account-school-outline" text="No hay inscripciones con estos filtros." />
</template>
