<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiInput, DuiBadge } from '@dronico/droni-kit'
import { usePaginatedList } from '../../../composables/usePaginatedList'
import { formatDate } from '../../../utils/format'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../components/ui/StatusBadge.vue'
import UserAvatar from '../../../components/ui/UserAvatar.vue'
import EmptyState from '../../../components/ui/EmptyState.vue'
import type { Comment } from '../../../types/AppiService'

const columns = [
  { label: 'Comentario', name: 'content' },
  { label: 'Autor', name: 'user' },
  { label: 'Recurso', name: 'commentableType' },
  { label: 'Estado', name: 'active' },
  { label: 'Fecha', name: 'createdAt' },
]

const q = ref('')
const { rows, loading, tablePagination, fetch } = usePaginatedList<Comment>('/admin/social/comments', () => ({ q: q.value.trim() }))

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Comentarios" subtitle="Moderación de comentarios del sitio" />

  <form class="mb-4 max-w-md" @submit.prevent="fetch(1)">
    <DuiInput v-model="q" block placeholder="Buscar en el contenido y presiona Enter" />
  </form>

  <DuiTable :columns="columns" :rows="rows" :loading="loading" :pagination="tablePagination" @paginate="fetch">
    <template #content="{ id, content }">
      <RouterLink :to="`/social/comments/${id}`" class="line-clamp-2 max-w-md hover:underline">{{ content }}</RouterLink>
    </template>
    <template #user="{ user }">
      <UserAvatar :user="user" />
    </template>
    <template #commentableType="{ commentableType }">
      <DuiBadge :label="commentableType ?? '—'" size="xs" />
    </template>
    <template #active="{ active }">
      <StatusBadge :status="active" on="Visible" off="Oculto" />
    </template>
    <template #createdAt="{ createdAt }">{{ formatDate(createdAt) }}</template>
  </DuiTable>
  <EmptyState v-if="!loading && !rows.length" icon="mdi-comment-off-outline" text="No hay comentarios." />
</template>
