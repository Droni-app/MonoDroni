<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton, DuiInput } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { Topic, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const columns = [
  { label: 'Nombre', name: 'name' },
  { label: 'Grupo', name: 'group' },
  { label: 'Autor', name: 'user' },
  { label: 'Activo', name: 'active' },
  { label: 'Actualizado', name: 'updatedAt' },
]

const rows = ref<Topic[]>([])
const loading = ref(false)
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })
const q = ref('')

async function fetchTopics(page = 1) {
  loading.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<Topic>>('/admin/social/topics', {
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

onMounted(() => fetchTopics())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Topics</h1>
      <div class="flex items-center gap-2">
        <DuiInput
          v-model="q"
          placeholder="Buscar..."
          @keydown.enter="fetchTopics(1)"
        />
        <DuiButton color="secondary" size="sm" @click="fetchTopics(1)">
          <i class="mdi mdi-magnify" />
        </DuiButton>
      </div>
    </div>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchTopics"
    >
      <template #name="{ id, name, slug }">
        <RouterLink :to="`/social/topics/${id}`" class="hover:underline">
          <p class="font-semibold text-slate-800 dark:text-slate-100">{{ name }}</p>
          <p class="text-xs text-slate-400 dark:text-slate-500">{{ slug }}</p>
        </RouterLink>
      </template>
      <template #group="{ group }">
        <span v-if="group" class="inline-block px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs">
          {{ group }}
        </span>
        <span v-else class="text-slate-400 text-xs">—</span>
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
      <template #updatedAt="{ updatedAt }">
        {{ new Date(updatedAt).toLocaleDateString() }}
      </template>
    </DuiTable>
  </div>
</template>
