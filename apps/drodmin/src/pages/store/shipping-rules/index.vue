<script setup lang="ts">
import { onMounted } from 'vue'
import { DuiTable, DuiButton } from '@dronico/droni-kit'
import { usePaginatedList } from '../../../composables/usePaginatedList'
import { formatMoney } from '../../../utils/format'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../components/ui/StatusBadge.vue'
import EmptyState from '../../../components/ui/EmptyState.vue'
import type { StoreShippingRule } from '../../../types/AppiService'

const columns = [
  { label: 'Nombre', name: 'name' },
  { label: 'Zona', name: 'zone' },
  { label: 'Base', name: 'price' },
  { label: '$/kg', name: 'pricePerKg' },
  { label: '$/cm³', name: 'pricePerCm3' },
  { label: 'Estado', name: 'active' },
  { label: '', name: 'actions', classes: 'text-right' },
]

const { rows, loading, tablePagination, fetch } = usePaginatedList<StoreShippingRule>('/admin/store/shipping-rules')

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Reglas de envío" subtitle="Costo de envío por zona, peso y volumen">
    <DuiButton color="primary" to="/store/shipping-rules/create">
      <i class="mdi mdi-plus mr-1" /> Nueva regla
    </DuiButton>
  </PageHeader>

  <DuiTable :columns="columns" :rows="rows" :loading="loading" :pagination="tablePagination" @paginate="fetch">
    <template #name="{ id, name }">
      <RouterLink :to="`/store/shipping-rules/${id}`" class="font-medium hover:underline">{{ name }}</RouterLink>
    </template>
    <template #zone="{ city, state }">
      {{ city?.name ?? state?.name ?? 'Nacional' }}
      <span v-if="city && state" class="text-xs text-slate-400">({{ state.name }})</span>
    </template>
    <template #price="{ price }">{{ formatMoney(price) }}</template>
    <template #pricePerKg="{ pricePerKg }">{{ pricePerKg ?? '—' }}</template>
    <template #pricePerCm3="{ pricePerCm3 }">{{ pricePerCm3 ?? '—' }}</template>
    <template #active="{ active }">
      <StatusBadge :status="active" />
    </template>
    <template #actions="{ id }">
      <div class="flex justify-end">
        <DuiButton variant="ghost" size="sm" title="Editar" :to="`/store/shipping-rules/${id}`">
          <i class="mdi mdi-pencil" />
        </DuiButton>
      </div>
    </template>
  </DuiTable>
  <EmptyState v-if="!loading && !rows.length" icon="mdi-truck-outline" text="No hay reglas de envío." />
</template>
