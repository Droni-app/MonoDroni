<script setup lang="ts">
import { onMounted } from 'vue'
import { DuiTable, DuiButton } from '@dronico/droni-kit'
import { usePaginatedList } from '../../../composables/usePaginatedList'
import { formatDate, formatMoney } from '../../../utils/format'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../components/ui/StatusBadge.vue'
import EmptyState from '../../../components/ui/EmptyState.vue'
import type { StoreCoupon } from '../../../types/AppiService'

const columns = [
  { label: 'Código', name: 'code' },
  { label: 'Descuento', name: 'discount' },
  { label: 'Pedido mínimo', name: 'minimumOrderValue' },
  { label: 'Vence', name: 'expirationDate' },
  { label: 'Estado', name: 'active' },
  { label: '', name: 'actions', classes: 'text-right' },
]

const { rows, loading, tablePagination, fetch } = usePaginatedList<StoreCoupon>('/admin/store/coupons')

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Cupones" subtitle="Códigos de descuento">
    <DuiButton color="primary" to="/store/coupons/create">
      <i class="mdi mdi-plus mr-1" /> Nuevo cupón
    </DuiButton>
  </PageHeader>

  <DuiTable :columns="columns" :rows="rows" :loading="loading" :pagination="tablePagination" @paginate="fetch">
    <template #code="{ id, code }">
      <RouterLink :to="`/store/coupons/${id}`" class="font-mono font-semibold hover:underline">{{ code }}</RouterLink>
    </template>
    <template #discount="{ discount, discountType }">
      {{ discountType === 'percentage' ? `${Number(discount)}%` : formatMoney(discount) }}
    </template>
    <template #minimumOrderValue="{ minimumOrderValue }">{{ formatMoney(minimumOrderValue) }}</template>
    <template #expirationDate="{ expirationDate }">{{ formatDate(expirationDate) }}</template>
    <template #active="{ active }">
      <StatusBadge :status="active" />
    </template>
    <template #actions="{ id }">
      <div class="flex justify-end">
        <DuiButton variant="ghost" size="sm" title="Editar" :to="`/store/coupons/${id}`">
          <i class="mdi mdi-pencil" />
        </DuiButton>
      </div>
    </template>
  </DuiTable>
  <EmptyState v-if="!loading && !rows.length" icon="mdi-ticket-percent-outline" text="No hay cupones." />
</template>
