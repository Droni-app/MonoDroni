<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { Post, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const columns = [
  { label: 'Nombre', name: 'name' },
  { label: 'Slug', name: 'slug' },
  { label: 'Tags', name: 'tags' },
  { label: 'Activo', name: 'active' },
  { label: 'Creado', name: 'createdAt' },
  { label: '', name: 'actions' },
]

const rows = ref<Post[]>([])
const loading = ref(false)
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })

async function fetchPosts(page = 1) {
  loading.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<Post>>('/admin/content/posts', { params: { page } })
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

onMounted(() => fetchPosts())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Posts</h1>
      <RouterLink to="/content/posts/create">
        <DuiButton color="primary" size="sm">
          <i class="mdi mdi-plus mr-1" /> Nuevo post
        </DuiButton>
      </RouterLink>
    </div>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchPosts"
    >
      <template #tags="{ tags }">
        <span
          v-for="tag in (tags ?? [])"
          :key="tag"
          class="inline-block mr-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs"
        >
          {{ tag }}
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
        <RouterLink :to="`/content/posts/${id}`">
          <DuiButton size="sm" color="secondary">
            <i class="mdi mdi-pencil" />
          </DuiButton>
        </RouterLink>
      </template>
    </DuiTable>
  </div>
</template>
