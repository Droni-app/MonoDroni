<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton, DuiSelect } from '@dronico/droni-kit'
import { usePaginatedList } from '../../../composables/usePaginatedList'
import { formatDate, formatMoney } from '../../../utils/format'
import { PAYMENT_STATUSES } from '../../../utils/labels'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../components/ui/StatusBadge.vue'
import EmptyState from '../../../components/ui/EmptyState.vue'
import type { StorePayment } from '../../../types/AppiService'

const columns = [
  { label: 'Pedido', name: 'orderId' },
  { label: 'Método', name: 'paymentMethod' },
  { label: 'Monto', name: 'amount' },
  { label: 'Estado', name: 'paymentStatus' },
  { label: 'Fecha', name: 'createdAt' },
  { label: '', name: 'actions', classes: 'text-right' },
]

const status = ref('')
const { rows, loading, tablePagination, fetch } = usePaginatedList<StorePayment>('/admin/store/payments', () => ({ status: status.value }))

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Pagos" subtitle="Transacciones de los pedidos">
    <DuiSelect
      v-model="status"
      :options="PAYMENT_STATUSES"
      item-label="label"
      item-value="value"
      placeholder="Todos los estados"
      @update:model-value="fetch(1)"
    />
  </PageHeader>

  <DuiTable :columns="columns" :rows="rows" :loading="loading" :pagination="tablePagination" @paginate="fetch">
    <template #orderId="{ orderId }">
      <RouterLink :to="`/store/orders/${orderId}`" class="font-mono text-xs hover:underline">#{{ orderId?.slice(0, 8) }}</RouterLink>
    </template>
    <template #paymentMethod="{ paymentMethod }"><span class="capitalize">{{ paymentMethod }}</span></template>
    <template #amount="{ amount, currency }">
      <span class="font-medium">{{ formatMoney(amount) }}</span> <span class="text-xs text-slate-400">{{ currency }}</span>
    </template>
    <template #paymentStatus="{ paymentStatus }">
      <StatusBadge :status="paymentStatus" />
    </template>
    <template #createdAt="{ createdAt }">{{ formatDate(createdAt) }}</template>
    <template #actions="{ id }">
      <div class="flex justify-end">
        <DuiButton variant="ghost" size="sm" title="Ver" :to="`/store/payments/${id}`">
          <i class="mdi mdi-eye-outline" />
        </DuiButton>
      </div>
    </template>
  </DuiTable>
  <EmptyState v-if="!loading && !rows.length" icon="mdi-credit-card-outline" text="No hay pagos." />
</template>
