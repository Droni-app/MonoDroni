<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { StoreOrder, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const columns = [
  { label: 'ID', name: 'id' },
  { label: 'Usuario', name: 'user' },
  { label: 'Total', name: 'total' },
  { label: 'Estado', name: 'status' },
  { label: 'Fecha', name: 'createdAt' },
  { label: '', name: 'actions' },
]

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  completed: 'Completado',
  canceled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600',
  paid: 'text-blue-600',
  shipped: 'text-purple-600',
  completed: 'text-green-600',
  canceled: 'text-red-500',
}

const rows = ref<StoreOrder[]>([])
const loading = ref(false)
const statusFilter = ref('')
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })

async function fetchOrders(page = 1) {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page }
    if (statusFilter.value) params.status = statusFilter.value
    const { data } = await AppiService.get<PaginatedResponse<StoreOrder>>('/admin/store/orders', { params })
    rows.value = data.data
    meta.value = { total: data.meta.total, perPage: data.meta.perPage, currentPage: data.meta.currentPage }
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchOrders())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Pedidos</h1>
      <select
        v-model="statusFilter"
        class="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm"
        @change="fetchOrders(1)"
      >
        <option value="">Todos los estados</option>
        <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchOrders"
    >
      <template #id="{ id }">
        <span class="font-mono text-xs">{{ id.slice(0, 8) }}...</span>
      </template>
      <template #user="{ user }">
        {{ user?.fullName ?? 'Invitado' }}
      </template>
      <template #total="{ total }">
        {{ Number(total).toFixed(2) }}
      </template>
      <template #status="{ status }">
        <span :class="STATUS_COLORS[status] ?? ''">{{ STATUS_LABELS[status] ?? status }}</span>
      </template>
      <template #createdAt="{ createdAt }">
        {{ new Date(createdAt).toLocaleDateString() }}
      </template>
      <template #actions="{ id }">
        <RouterLink :to="`/store/orders/${id}`">
          <DuiButton size="sm" color="secondary">
            <i class="mdi mdi-eye" />
          </DuiButton>
        </RouterLink>
      </template>
    </DuiTable>
  </div>
</template>
