<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { Post, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const columns = [
  { label: 'Nombre', name: 'name' },
  { label: 'Slug', name: 'slug' },
  { label: 'Tags', name: 'tags' },
  { label: 'Activo', name: 'active' },
  { label: 'Creado', name: 'createdAt' },
  { label: '', name: 'actions' },
]

const rows = ref<Post[]>([])
const loading = ref(false)
const exportingId = ref<string | null>(null)
const importing = ref(false)
const importError = ref<string | null>(null)
const importSuccess = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })

async function fetchPosts(page = 1) {
  loading.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<Post>>('/admin/content/posts', { params: { page } })
    rows.value = data.data
    meta.value = {
      total: data.meta.total,
      perPage: data.meta.perPage,
      currentPage: data.meta.currentPage,
    }
  } finally {
    loading.value = false
  }
}

async function exportPost(id: string, fallbackSlug?: string) {
  exportingId.value = id
  try {
    const { data } = await AppiService.get<Post>(`/admin/content/posts/${id}`)
    const filename = `${data.slug || fallbackSlug || 'post'}.json`
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } finally {
    exportingId.value = null
  }
}

function triggerImport() {
  importError.value = null
  importSuccess.value = false
  fileInputRef.value?.click()
}

async function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  importing.value = true
  importError.value = null
  importSuccess.value = false

  try {
    const text = await file.text()
    const payload = JSON.parse(text)
    await AppiService.post('/admin/content/posts/import', payload)
    importSuccess.value = true
    await fetchPosts(meta.value.currentPage)
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Error al importar el post'
    importError.value = msg
  } finally {
    importing.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

onMounted(() => fetchPosts())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Posts</h1>
      <div class="flex items-center gap-2">
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          class="hidden"
          @change="onFileSelected"
        />
        <DuiButton color="secondary" size="sm" :disabled="importing" @click="triggerImport">
          <i class="mdi mdi-upload mr-1" />
          {{ importing ? 'Importando...' : 'Importar' }}
        </DuiButton>
        <RouterLink to="/content/posts/create">
          <DuiButton color="primary" size="sm">
            <i class="mdi mdi-plus mr-1" /> Nuevo post
          </DuiButton>
        </RouterLink>
      </div>
    </div>
    <div v-if="importSuccess" class="mb-4 px-4 py-3 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm">
      Post importado correctamente.
    </div>
    <div v-if="importError" class="mb-4 px-4 py-3 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm">
      {{ importError }}
    </div>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchPosts"
    >
      <template #tags="{ tags }">
        <span
          v-for="tag in (tags ?? [])"
          :key="tag"
          class="inline-block mr-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs"
        >
          {{ tag }}
        </span>
      </template>
      <template #active="{ active }">
        <span :class="active ? 'text-green-600' : 'text-red-500'">
          {{ active ? 'Sí' : 'No' }}
        </span>
      </template>
      <template #createdAt="{ createdAt }">
        {{ new Date(createdAt).toLocaleDateString() }}
      </template>
      <template #actions="{ id, slug }">
        <div class="flex items-center gap-2">
          <DuiButton
            size="sm"
            color="secondary"
            :disabled="exportingId === id"
            @click="exportPost(id, slug)"
          >
            <i class="mdi mdi-download" />
          </DuiButton>
          <RouterLink :to="`/content/posts/${id}`">
            <DuiButton size="sm" color="secondary">
            <i class="mdi mdi-pencil" />
            </DuiButton>
          </RouterLink>
        </div>
      </template>
    </DuiTable>
  </div>
</template>
