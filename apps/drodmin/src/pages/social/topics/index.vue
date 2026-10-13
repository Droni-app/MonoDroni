<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiInput, DuiButton } from '@dronico/droni-kit'
import { usePaginatedList } from '../../../composables/usePaginatedList'
import { formatDate } from '../../../utils/format'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../components/ui/StatusBadge.vue'
import UserAvatar from '../../../components/ui/UserAvatar.vue'
import EmptyState from '../../../components/ui/EmptyState.vue'
import type { Topic } from '../../../types/AppiService'

const columns = [
  { label: 'Tema', name: 'name' },
  { label: 'Autor', name: 'user' },
  { label: 'Estado', name: 'active' },
  { label: 'Actualizado', name: 'updatedAt' },
  { label: '', name: 'actions', classes: 'text-right' },
]

const q = ref('')
const { rows, loading, tablePagination, fetch } = usePaginatedList<Topic>('/admin/social/topics', () => ({ q: q.value.trim() }))

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Temas" subtitle="Foros y conversaciones de la comunidad" />

  <form class="mb-4 max-w-md" @submit.prevent="fetch(1)">
    <DuiInput v-model="q" block placeholder="Buscar por nombre o contenido y presiona Enter" />
  </form>

  <DuiTable :columns="columns" :rows="rows" :loading="loading" :pagination="tablePagination" @paginate="fetch">
    <template #name="{ id, name, slug }">
      <RouterLink :to="`/social/topics/${id}`" class="font-medium hover:underline">{{ name }}</RouterLink>
      <p class="text-xs text-slate-400">{{ slug }}</p>
    </template>
    <template #user="{ user }">
      <UserAvatar :user="user" />
    </template>
    <template #active="{ active }">
      <StatusBadge :status="active" on="Visible" off="Oculto" />
    </template>
    <template #updatedAt="{ updatedAt }">{{ formatDate(updatedAt) }}</template>
    <template #actions="{ id }">
      <div class="flex justify-end">
        <DuiButton variant="ghost" size="sm" title="Editar" :to="`/social/topics/${id}`">
          <i class="mdi mdi-pencil" />
        </DuiButton>
      </div>
    </template>
  </DuiTable>
  <EmptyState v-if="!loading && !rows.length" icon="mdi-forum-outline" text="No hay temas." />
</template>
