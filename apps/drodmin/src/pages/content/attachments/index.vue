<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DuiButton, DuiAlert } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { Attachment, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const rows = ref<Attachment[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const copiedId = ref<string | null>(null)
const meta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 16, currentPage: 1 })

const totalPages = computed(() => Math.max(1, Math.ceil(meta.value.total / meta.value.perPage)))
const hasPreviousPage = computed(() => meta.value.currentPage > 1)
const hasNextPage = computed(() => meta.value.currentPage < totalPages.value)

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mime: string): boolean {
  return mime.toLowerCase().startsWith('image/')
}

async function fetchAttachments(page = 1) {
  loading.value = true
  error.value = null
  try {
    const { data } = await AppiService.get<PaginatedResponse<Attachment>>('/admin/content/attachments', {
      params: {
        page,
        per_page: 16,
      },
    })
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

async function copyUrl(attachment: Attachment) {
  if (!attachment.url) return
  await navigator.clipboard.writeText(attachment.url)
  copiedId.value = attachment.id
  setTimeout(() => { copiedId.value = null }, 1500)
}

function goToPreviousPage() {
  if (!hasPreviousPage.value || loading.value) return
  fetchAttachments(meta.value.currentPage - 1)
}

function goToNextPage() {
  if (!hasNextPage.value || loading.value) return
  fetchAttachments(meta.value.currentPage + 1)
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

    <p v-if="loading" class="text-slate-500 dark:text-slate-400">Cargando attachments...</p>

    <div v-else-if="rows.length" class="masonry">
      <article
        v-for="attachment in rows"
        :key="attachment.id"
        class="card border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg overflow-hidden"
      >
        <a
          v-if="isImage(attachment.mime) && attachment.url"
          :href="attachment.url"
          target="_blank"
          rel="noopener noreferrer"
          class="preview-link"
        >
          <img
            :src="attachment.url"
            :alt="attachment.name"
            class="preview-image"
            loading="lazy"
          >
        </a>
        <a
          v-else-if="attachment.url"
          :href="attachment.url"
          target="_blank"
          rel="noopener noreferrer"
          class="preview-placeholder"
        >
          <i class="mdi mdi-file-document-outline preview-icon" />
        </a>
        <div v-else class="preview-placeholder">
          <i class="mdi mdi-file-document-outline preview-icon" />
        </div>

        <div class="p-4">
          <p
            class="font-semibold break-all cursor-pointer select-none"
            :class="copiedId === attachment.id
              ? 'text-green-600 dark:text-green-400'
              : 'text-slate-800 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400'"
            :title="copiedId === attachment.id ? '¡URL copiada!' : 'Clic para copiar URL'"
            @click="copyUrl(attachment)"
          >
            <i v-if="copiedId === attachment.id" class="mdi mdi-check mr-1" />
            {{ attachment.name }}
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 break-all">{{ attachment.mime }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ formatSize(attachment.size) }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ new Date(attachment.createdAt).toLocaleDateString() }}
          </p>

          <div class="flex items-center gap-2 mt-4">
            <a
              v-if="attachment.url"
              :href="attachment.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <DuiButton size="sm" color="secondary">
                <i class="mdi mdi-open-in-new" />
              </DuiButton>
            </a>
            <DuiButton
              size="sm"
              color="danger"
              :loading="deletingId === attachment.id"
              @click="handleDelete(attachment.id, attachment.name)"
            >
              <i class="mdi mdi-trash-can" />
            </DuiButton>
          </div>
        </div>
      </article>
    </div>

    <p v-else class="text-slate-500 dark:text-slate-400">No hay attachments aún.</p>

    <div class="flex items-center justify-between mt-6 gap-3">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Página {{ meta.currentPage }} de {{ totalPages }}
      </p>
      <div class="flex items-center gap-2">
        <DuiButton size="sm" color="secondary" :disabled="!hasPreviousPage || loading" @click="goToPreviousPage">
          Anterior
        </DuiButton>
        <DuiButton size="sm" color="secondary" :disabled="!hasNextPage || loading" @click="goToNextPage">
          Siguiente
        </DuiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.masonry {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: masonry;
  gap: 1rem;
}

.card {
  break-inside: avoid;
}

.preview-link,
.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

.preview-icon {
  font-size: 3.5rem;
  color: #64748b;
}

@media (max-width: 1200px) {
  .masonry {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .masonry {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .masonry {
    grid-template-columns: 1fr;
  }
}
</style>
