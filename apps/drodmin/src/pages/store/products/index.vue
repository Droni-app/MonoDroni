<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton, DuiInput } from '@dronico/droni-kit'
import { usePaginatedList } from '../../../composables/usePaginatedList'
import { formatMoney } from '../../../utils/format'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../components/ui/StatusBadge.vue'
import EmptyState from '../../../components/ui/EmptyState.vue'
import type { StoreProduct } from '../../../types/AppiService'

const columns = [
  { label: 'Producto', name: 'name' },
  { label: 'Precio', name: 'price' },
  { label: 'Stock', name: 'stock' },
  { label: 'Estado', name: 'active' },
  { label: '', name: 'actions', classes: 'text-right' },
]

const q = ref('')
const { rows, loading, tablePagination, fetch } = usePaginatedList<StoreProduct>('/admin/store/products', () => ({ q: q.value.trim() }))

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Productos" subtitle="Catálogo de la tienda">
    <DuiButton color="primary" to="/store/products/create">
      <i class="mdi mdi-plus mr-1" /> Nuevo producto
    </DuiButton>
  </PageHeader>

  <form class="mb-4 max-w-md" @submit.prevent="fetch(1)">
    <DuiInput v-model="q" block placeholder="Buscar productos y presiona Enter" />
  </form>

  <DuiTable :columns="columns" :rows="rows" :loading="loading" :pagination="tablePagination" @paginate="fetch">
    <template #name="{ id, name, picture, slug }">
      <RouterLink :to="`/store/products/${id}`" class="flex items-center gap-3 hover:underline">
        <img v-if="picture" :src="picture" alt="" class="h-10 w-10 rounded-lg object-cover" />
        <span v-else class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
          <i class="mdi mdi-package-variant-closed text-slate-400" />
        </span>
        <span>
          <span class="block font-medium">{{ name }}</span>
          <span class="block text-xs text-slate-400">{{ slug }}</span>
        </span>
      </RouterLink>
    </template>
    <template #price="{ price }">{{ formatMoney(price) }}</template>
    <template #stock="{ stock }">
      <span :class="{ 'font-semibold text-red-500': stock <= 0 }">{{ stock }}</span>
    </template>
    <template #active="{ active }">
      <StatusBadge :status="active" on="Disponible" off="Oculto" />
    </template>
    <template #actions="{ id }">
      <div class="flex justify-end">
        <DuiButton variant="ghost" size="sm" title="Editar" :to="`/store/products/${id}`">
          <i class="mdi mdi-pencil" />
        </DuiButton>
      </div>
    </template>
  </DuiTable>
  <EmptyState v-if="!loading && !rows.length" icon="mdi-package-variant" text="No hay productos." />
</template>
