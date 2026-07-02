<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { StoreCoupon, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const columns = [
  { label: 'Código', name: 'code' },
  { label: 'Descuento', name: 'discount' },
  { label: 'Tipo', name: 'discountType' },
  { label: 'Mín. pedido', name: 'minimumOrderValue' },
  { label: 'Vencimiento', name: 'expirationDate' },
  { label: 'Activo', name: 'active' },
  { label: '', name: 'actions' },
]

const rows = ref<StoreCoupon[]>([])
const loading = ref(false)
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })

async function fetchCoupons(page = 1) {
  loading.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<StoreCoupon>>('/admin/store/coupons', { params: { page } })
    rows.value = data.data
    meta.value = { total: data.meta.total, perPage: data.meta.perPage, currentPage: data.meta.currentPage }
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchCoupons())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Cupones</h1>
      <RouterLink to="/store/coupons/create">
        <DuiButton color="primary" size="sm">
          <i class="mdi mdi-plus mr-1" /> Nuevo cupón
        </DuiButton>
      </RouterLink>
    </div>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchCoupons"
    >
      <template #code="{ code }">
        <span class="font-mono font-bold">{{ code }}</span>
      </template>
      <template #discount="{ discount, discountType }">
        {{ discountType === 'percentage' ? `${discount}%` : `$${Number(discount).toFixed(2)}` }}
      </template>
      <template #discountType="{ discountType }">
        {{ discountType === 'percentage' ? 'Porcentaje' : 'Fijo' }}
      </template>
      <template #minimumOrderValue="{ minimumOrderValue }">
        {{ minimumOrderValue != null ? `$${Number(minimumOrderValue).toFixed(2)}` : '—' }}
      </template>
      <template #expirationDate="{ expirationDate }">
        {{ expirationDate ? new Date(expirationDate).toLocaleDateString() : '—' }}
      </template>
      <template #active="{ active }">
        <span :class="active ? 'text-green-600' : 'text-red-500'">{{ active ? 'Sí' : 'No' }}</span>
      </template>
      <template #actions="{ id }">
        <RouterLink :to="`/store/coupons/${id}`">
          <DuiButton size="sm" color="secondary">
            <i class="mdi mdi-pencil" />
          </DuiButton>
        </RouterLink>
      </template>
    </DuiTable>
  </div>
</template>
