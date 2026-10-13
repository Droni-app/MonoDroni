<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton, DuiSelect } from '@dronico/droni-kit'
import { usePaginatedList } from '../../../composables/usePaginatedList'
import { formatDate, formatMoney } from '../../../utils/format'
import { ORDER_STATUSES } from '../../../utils/labels'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../components/ui/StatusBadge.vue'
import UserAvatar from '../../../components/ui/UserAvatar.vue'
import EmptyState from '../../../components/ui/EmptyState.vue'
import type { StoreOrder } from '../../../types/AppiService'

const columns = [
  { label: 'Pedido', name: 'id' },
  { label: 'Cliente', name: 'user' },
  { label: 'Total', name: 'total' },
  { label: 'Estado', name: 'status' },
  { label: 'Fecha', name: 'createdAt' },
  { label: '', name: 'actions', classes: 'text-right' },
]

const status = ref('')
const { rows, loading, tablePagination, fetch } = usePaginatedList<StoreOrder>('/admin/store/orders', () => ({ status: status.value }))

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Pedidos" subtitle="Órdenes de compra de la tienda">
    <DuiSelect
      v-model="status"
      :options="ORDER_STATUSES"
      item-label="label"
      item-value="value"
      placeholder="Todos los estados"
      @update:model-value="fetch(1)"
    />
  </PageHeader>

  <DuiTable :columns="columns" :rows="rows" :loading="loading" :pagination="tablePagination" @paginate="fetch">
    <template #id="{ id }">
      <RouterLink :to="`/store/orders/${id}`" class="font-mono text-xs hover:underline">#{{ id.slice(0, 8) }}</RouterLink>
    </template>
    <template #user="{ user }">
      <UserAvatar :user="user" />
    </template>
    <template #total="{ total }">
      <span class="font-medium">{{ formatMoney(total) }}</span>
    </template>
    <template #status="{ status }">
      <StatusBadge :status="status" />
    </template>
    <template #createdAt="{ createdAt }">{{ formatDate(createdAt) }}</template>
    <template #actions="{ id }">
      <div class="flex justify-end">
        <DuiButton variant="ghost" size="sm" title="Ver" :to="`/store/orders/${id}`">
          <i class="mdi mdi-eye-outline" />
        </DuiButton>
      </div>
    </template>
  </DuiTable>
  <EmptyState v-if="!loading && !rows.length" icon="mdi-cart-outline" text="No hay pedidos." />
</template>
