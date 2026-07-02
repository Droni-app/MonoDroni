<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { StoreShippingRule, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const columns = [
  { label: 'Nombre', name: 'name' },
  { label: 'Estado/Dpto.', name: 'state' },
  { label: 'Ciudad', name: 'city' },
  { label: 'Precio base', name: 'price' },
  { label: '$/kg', name: 'pricePerKg' },
  { label: '$/cm³', name: 'pricePerCm3' },
  { label: 'Activa', name: 'active' },
  { label: '', name: 'actions' },
]

const rows = ref<StoreShippingRule[]>([])
const loading = ref(false)
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })

async function fetchRules(page = 1) {
  loading.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<StoreShippingRule>>('/admin/store/shipping-rules', { params: { page } })
    rows.value = data.data
    meta.value = { total: data.meta.total, perPage: data.meta.perPage, currentPage: data.meta.currentPage }
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchRules())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Reglas de envío</h1>
      <RouterLink to="/store/shipping-rules/create">
        <DuiButton color="primary" size="sm">
          <i class="mdi mdi-plus mr-1" /> Nueva regla
        </DuiButton>
      </RouterLink>
    </div>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchRules"
    >
      <template #state="{ state }">
        {{ state?.name ?? '—' }}
      </template>
      <template #city="{ city }">
        {{ city?.name ?? '—' }}
      </template>
      <template #price="{ price }">
        ${{ Number(price).toFixed(2) }}
      </template>
      <template #pricePerKg="{ pricePerKg }">
        {{ pricePerKg != null ? `$${Number(pricePerKg).toFixed(4)}` : '—' }}
      </template>
      <template #pricePerCm3="{ pricePerCm3 }">
        {{ pricePerCm3 != null ? `$${Number(pricePerCm3).toFixed(8)}` : '—' }}
      </template>
      <template #active="{ active }">
        <span :class="active ? 'text-green-600' : 'text-red-500'">{{ active ? 'Sí' : 'No' }}</span>
      </template>
      <template #actions="{ id }">
        <RouterLink :to="`/store/shipping-rules/${id}`">
          <DuiButton size="sm" color="secondary">
            <i class="mdi mdi-pencil" />
          </DuiButton>
        </RouterLink>
      </template>
    </DuiTable>
  </div>
</template>
