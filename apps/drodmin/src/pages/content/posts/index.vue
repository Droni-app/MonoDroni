<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton, DuiInput, DuiBadge, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../../services/AppiService'
import { usePaginatedList } from '../../../composables/usePaginatedList'
import { formatDate } from '../../../utils/format'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../components/ui/StatusBadge.vue'
import EmptyState from '../../../components/ui/EmptyState.vue'
import type { Post } from '../../../types/AppiService'

const columns = [
  { label: 'Nombre', name: 'name' },
  { label: 'Tags', name: 'tags' },
  { label: 'Estado', name: 'active' },
  { label: 'Creado', name: 'createdAt' },
  { label: '', name: 'actions', classes: 'text-right' },
]

const toast = useToast()
const q = ref('')
const { rows, loading, tablePagination, fetch } = usePaginatedList<Post>('/admin/content/posts', () => ({ q: q.value.trim() }))

// --- Export / import as JSON ---
const importInput = ref<HTMLInputElement | null>(null)
const importing = ref(false)

async function exportPost(id: string) {
  const { data } = await AppiService.get<Post>(`/admin/content/posts/${id}`)
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  link.download = `${data.slug || 'post'}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

async function importPost(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  importing.value = true
  try {
    await AppiService.post('/admin/content/posts/import', JSON.parse(await file.text()))
    toast.success('Post importado correctamente.')
    fetch(1)
  } catch (e: any) {
    toast.error(apiError(e, e?.message ?? 'Error al importar el post.'))
  } finally {
    importing.value = false
    input.value = ''
  }
}

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Posts" subtitle="Artículos y páginas del sitio">
    <input ref="importInput" type="file" accept=".json" class="hidden" @change="importPost" />
    <DuiButton variant="outline" :loading="importing" @click="importInput?.click()">
      <i class="mdi mdi-upload mr-1" /> Importar JSON
    </DuiButton>
    <DuiButton color="primary" to="/content/posts/create">
      <i class="mdi mdi-plus mr-1" /> Nuevo post
    </DuiButton>
  </PageHeader>

  <form class="mb-4 max-w-md" @submit.prevent="fetch(1)">
    <DuiInput v-model="q" block placeholder="Buscar por nombre o descripción y presiona Enter" />
  </form>

  <DuiTable :columns="columns" :rows="rows" :loading="loading" :pagination="tablePagination" @paginate="fetch">
    <template #name="{ id, name, slug }">
      <RouterLink :to="`/content/posts/${id}`" class="font-medium hover:underline">{{ name }}</RouterLink>
      <p class="text-xs text-slate-400">{{ slug }}</p>
    </template>
    <template #tags="{ tags }">
      <div class="flex flex-wrap gap-1">
        <DuiBadge v-for="tag in tags ?? []" :key="tag" :label="tag" size="xs" />
      </div>
    </template>
    <template #active="{ active }">
      <StatusBadge :status="active" on="Publicado" off="Borrador" />
    </template>
    <template #createdAt="{ createdAt }">{{ formatDate(createdAt) }}</template>
    <template #actions="{ id }">
      <div class="flex justify-end gap-1">
        <DuiButton variant="ghost" size="sm" title="Exportar JSON" @click="exportPost(id)">
          <i class="mdi mdi-download" />
        </DuiButton>
        <DuiButton variant="ghost" size="sm" title="Editar" :to="`/content/posts/${id}`">
          <i class="mdi mdi-pencil" />
        </DuiButton>
      </div>
    </template>
  </DuiTable>
  <EmptyState v-if="!loading && !rows.length" />
</template>
