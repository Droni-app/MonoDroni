<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuiTable, DuiButton, DuiAlert } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { Attachment, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const columns = [
  { label: 'Nombre', name: 'name' },
  { label: 'Tipo', name: 'mime' },
  { label: 'Tamaño', name: 'size' },
  { label: 'Creado', name: 'createdAt' },
  { label: 'Enlace', name: 'url' },
  { label: '', name: 'actions' },
]

const rows = ref<Attachment[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 10, currentPage: 1 })

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function fetchAttachments(page = 1) {
  loading.value = true
  error.value = null
  try {
    const { data } = await AppiService.get<PaginatedResponse<Attachment>>('/admin/content/attachments', { params: { page } })
    rows.value = data.data
    meta.value = {
      total: data.meta.total,
      perPage: data.meta.perPage,
      currentPage: data.meta.currentPage,
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al cargar los attachments.'
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: string, name: string) {
  if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
  deletingId.value = id
  error.value = null
  try {
    await AppiService.delete(`/admin/content/attachments/${id}`)
    rows.value = rows.value.filter(r => r.id !== id)
    meta.value.total = Math.max(0, meta.value.total - 1)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al eliminar el attachment.'
  } finally {
    deletingId.value = null
  }
}

onMounted(() => fetchAttachments())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Attachments</h1>
      <RouterLink to="/content/attachments/create">
        <DuiButton color="primary" size="sm">
          <i class="mdi mdi-plus mr-1" /> Subir archivo
        </DuiButton>
      </RouterLink>
    </div>
    <DuiAlert v-if="error" color="danger" class="mb-4">{{ error }}</DuiAlert>
    <DuiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="{ page: meta.currentPage, perPage: meta.perPage, total: meta.total }"
      @paginate="fetchAttachments"
    >
      <template #size="{ size }">
        {{ formatSize(size) }}
      </template>
      <template #createdAt="{ createdAt }">
        {{ new Date(createdAt).toLocaleDateString() }}
      </template>
      <template #url="{ url }">
        <a :href="url" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">
          <i class="mdi mdi-open-in-new" />
        </a>
      </template>
      <template #actions="{ id, name }">
        <DuiButton
          size="sm"
          color="danger"
          :loading="deletingId === id"
          @click="handleDelete(id, name)"
        >
          <i class="mdi mdi-trash-can" />
        </DuiButton>
      </template>
    </DuiTable>
  </div>
</template>
