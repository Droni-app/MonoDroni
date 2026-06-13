<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton, DuiInput } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { Comment, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const columns = [
  { label: 'Contenido', name: 'content' },
  { label: 'Recurso', name: 'commentableType' },
  { label: 'Autor', name: 'user' },
  { label: 'Activo', name: 'active' },
  { label: 'Fecha', name: 'createdAt' },
]

const rows = ref<Comment[]>([])
const loading = ref(false)
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })
const q = ref('')

async function fetchComments(page = 1) {
  loading.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<Comment>>('/admin/social/comments', {
      params: { page, per_page: meta.value.perPage, q: q.value || undefined },
    })
    rows.value = data.data
    meta.value = {
      total: data.meta.total,
      perPage: data.meta.perPage,
      currentPage: data.meta.currentPage,
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchComments())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Comments</h1>
      <div class="flex items-center gap-2">
        <DuiInput
          v-model="q"
          placeholder="Buscar..."
          @keydown.enter="fetchComments(1)"
        />
        <DuiButton color="secondary" size="sm" @click="fetchComments(1)">
          <i class="mdi mdi-magnify" />
        </DuiButton>
      </div>
    </div>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchComments"
    >
      <template #content="{ id, content }">
        <RouterLink :to="`/social/comments/${id}`" class="hover:underline">
          <p class="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-xs">{{ content }}</p>
        </RouterLink>
      </template>
      <template #commentableType="{ commentableType }">
        <span class="inline-block px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs">
          {{ commentableType ?? '—' }}
        </span>
      </template>
      <template #user="{ user }">
        <div class="flex items-center gap-2">
          <img v-if="user?.avatar" :src="user.avatar" :alt="user.fullName" class="h-6 w-6 rounded-full object-cover" />
          <span v-else class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-semibold uppercase">
            {{ user?.fullName?.charAt(0) ?? '?' }}
          </span>
          <span class="text-sm">{{ user?.fullName }}</span>
        </div>
      </template>
      <template #active="{ active }">
        <span :class="active ? 'text-green-600' : 'text-red-500'">
          {{ active ? 'Sí' : 'No' }}
        </span>
      </template>
      <template #createdAt="{ createdAt }">
        {{ new Date(createdAt).toLocaleDateString() }}
      </template>
    </DuiTable>
  </div>
</template>
