<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { StorePayment, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const columns = [
  { label: 'Pedido', name: 'orderId' },
  { label: 'Método', name: 'paymentMethod' },
  { label: 'Estado', name: 'paymentStatus' },
  { label: 'Monto', name: 'amount' },
  { label: 'Moneda', name: 'currency' },
  { label: 'Fecha', name: 'createdAt' },
  { label: '', name: 'actions' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600',
  completed: 'text-green-600',
  failed: 'text-red-500',
}

const rows = ref<StorePayment[]>([])
const loading = ref(false)
const statusFilter = ref('')
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })

async function fetchPayments(page = 1) {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page }
    if (statusFilter.value) params.status = statusFilter.value
    const { data } = await AppiService.get<PaginatedResponse<StorePayment>>('/admin/store/payments', { params })
    rows.value = data.data
    meta.value = { total: data.meta.total, perPage: data.meta.perPage, currentPage: data.meta.currentPage }
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchPayments())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Pagos</h1>
      <select
        v-model="statusFilter"
        class="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm"
        @change="fetchPayments(1)"
      >
        <option value="">Todos los estados</option>
        <option value="pending">Pendiente</option>
        <option value="completed">Completado</option>
        <option value="failed">Fallido</option>
      </select>
    </div>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchPayments"
    >
      <template #orderId="{ orderId }">
        <span class="font-mono text-xs">{{ orderId?.slice(0, 8) }}...</span>
      </template>
      <template #paymentMethod="{ paymentMethod }">
        <span class="capitalize">{{ paymentMethod }}</span>
      </template>
      <template #paymentStatus="{ paymentStatus }">
        <span :class="STATUS_COLORS[paymentStatus] ?? ''">{{ paymentStatus }}</span>
      </template>
      <template #amount="{ amount }">
        {{ Number(amount).toFixed(2) }}
      </template>
      <template #createdAt="{ createdAt }">
        {{ new Date(createdAt).toLocaleDateString() }}
      </template>
      <template #actions="{ id }">
        <RouterLink :to="`/store/payments/${id}`">
          <DuiButton size="sm" color="secondary">
            <i class="mdi mdi-eye" />
          </DuiButton>
        </RouterLink>
      </template>
    </DuiTable>
  </div>
</template>
