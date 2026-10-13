<script setup lang="ts">
import { ref, watch } from 'vue'
import { DuiFile, DuiInput, DuiButton, DuiModal, DuiPagination, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../services/AppiService'
import type { Attachment, PaginatedResponse } from '../types/AppiService'
import EmptyState from './ui/EmptyState.vue'

// v-model is the file URL. Files can be uploaded, picked from the site's
// attachment library, or given as an external URL.
const model = defineModel<string | null>({ default: null })

const toast = useToast()
const isImage = (value?: string | null) => !!value && /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(value)

async function upload(file: File) {
  try {
    const formData = new FormData()
    formData.append('name', file.name.replace(/\.[^.]+$/, ''))
    formData.append('file', file)
    const { data } = await AppiService.post<Attachment>('/admin/content/attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    model.value = data.url ?? null
  } catch (e) {
    toast.error(apiError(e, 'Error al subir el archivo.'))
  }
}

function openFile(url: string) {
  window.open(url, '_blank', 'noopener')
}

// --- Library modal ---
const showBrowser = ref(false)
const search = ref('')
const externalUrl = ref('')
const files = ref<Attachment[]>([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)

async function fetchFiles() {
  loading.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<Attachment>>('/admin/content/attachments', {
      params: { page: page.value, per_page: 12, q: search.value || undefined },
    })
    files.value = data.data
    total.value = data.meta.total
  } finally {
    loading.value = false
  }
}

function openBrowser() {
  search.value = ''
  externalUrl.value = model.value ?? ''
  page.value = 1
  showBrowser.value = true
  fetchFiles()
}

function select(url?: string | null) {
  model.value = url || null
  showBrowser.value = false
}

let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; fetchFiles() }, 350)
})
watch(page, fetchFiles)
</script>

<template>
  <div class="flex items-center gap-3">
    <img v-if="isImage(model)" :src="model!" alt="" class="h-10 w-10 shrink-0 rounded-lg object-cover" />
    <DuiFile
      :model-value="model"
      class="min-w-0 flex-1"
      @upload-file="upload"
      @open-browser="openBrowser"
      @open-file="openFile"
    />
    <DuiButton v-if="model" variant="ghost" color="danger" size="sm" title="Quitar" @click="model = null">
      <i class="mdi mdi-close" />
    </DuiButton>

    <DuiModal v-model="showBrowser" title="Biblioteca de archivos" size="xl">
      <div class="flex flex-col gap-4">
        <DuiInput v-model="search" block placeholder="Buscar por nombre..." />

        <p v-if="loading" class="py-10 text-center text-sm text-slate-500">Cargando...</p>
        <EmptyState v-else-if="!files.length" text="No hay archivos" />
        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            v-for="file in files"
            :key="file.id"
            type="button"
            class="overflow-hidden rounded-lg border-2 border-transparent bg-slate-100 text-left transition hover:border-blue-500 dark:bg-slate-800"
            @click="select(file.url)"
          >
            <div class="flex h-24 items-center justify-center bg-slate-200 dark:bg-slate-700">
              <img v-if="file.mime.startsWith('image/') && file.url" :src="file.url" :alt="file.name" class="h-full w-full object-cover" loading="lazy" />
              <i v-else class="mdi mdi-file-document-outline text-3xl text-slate-400" />
            </div>
            <p class="truncate px-2 py-1 text-xs">{{ file.name }}</p>
          </button>
        </div>

        <DuiPagination v-if="total > 12" v-model="page" :total="total" :per-page="12" size="sm" />
      </div>

      <template #footer>
        <form class="flex w-full gap-2" @submit.prevent="select(externalUrl)">
          <DuiInput v-model="externalUrl" block placeholder="...o pega una URL externa" class="flex-1" />
          <DuiButton type="submit" color="primary">Usar URL</DuiButton>
        </form>
      </template>
    </DuiModal>
  </div>
</template>
