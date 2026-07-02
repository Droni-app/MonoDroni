<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton, DuiInput } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { StoreProduct, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const columns = [
  { label: 'Nombre', name: 'name' },
  { label: 'Precio', name: 'price' },
  { label: 'Stock', name: 'stock' },
  { label: 'Activo', name: 'active' },
  { label: 'Creado', name: 'createdAt' },
  { label: '', name: 'actions' },
]

const rows = ref<StoreProduct[]>([])
const loading = ref(false)
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })
const searchQuery = ref('')

async function fetchProducts(page = 1) {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page }
    if (searchQuery.value.trim()) params.q = searchQuery.value.trim()
    const { data } = await AppiService.get<PaginatedResponse<StoreProduct>>('/admin/store/products', { params })
    rows.value = data.data
    meta.value = { total: data.meta.total, perPage: data.meta.perPage, currentPage: data.meta.currentPage }
  } finally {
    loading.value = false
  }
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') fetchProducts(1)
}

onMounted(() => fetchProducts())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Productos</h1>
      <RouterLink to="/store/products/create">
        <DuiButton color="primary" size="sm">
          <i class="mdi mdi-plus mr-1" /> Nuevo producto
        </DuiButton>
      </RouterLink>
    </div>
    <div class="mb-4">
      <DuiInput v-model="searchQuery" placeholder="Buscar productos... (Enter para buscar)" @keydown="onSearchKeydown" />
    </div>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchProducts"
    >
      <template #price="{ price }">
        {{ Number(price).toFixed(2) }}
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
        <RouterLink :to="`/store/products/${id}`">
          <DuiButton size="sm" color="secondary">
            <i class="mdi mdi-pencil" />
          </DuiButton>
        </RouterLink>
      </template>
    </DuiTable>
  </div>
</template>
