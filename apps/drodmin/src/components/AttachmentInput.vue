<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DuiInput, DuiButton, DuiModal, DuiAlert } from '@dronico/droni-kit'
import AppiService from '../services/AppiService'
import type { Attachment, PaginatedResponse } from '../types/AppiService'

const props = withDefaults(defineProps<{
  modelValue: string | null
  placeholder?: string
}>(), {
  placeholder: 'URL del archivo',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const inputValue = computed({
  get: () => props.modelValue ?? '',
  set: (val: string) => emit('update:modelValue', val || null),
})

// --- File browser ---
const showBrowser = ref(false)
const browserSearch = ref('')
const browserRows = ref<Attachment[]>([])
const browserLoading = ref(false)
const browserError = ref<string | null>(null)
const browserMeta = ref({ total: 0, perPage: 16, currentPage: 1 })
const selectedAttachment = ref<Attachment | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(browserMeta.value.total / browserMeta.value.perPage)))
const hasPreviousPage = computed(() => browserMeta.value.currentPage > 1)
const hasNextPage = computed(() => browserMeta.value.currentPage < totalPages.value)

function isImage(mime: string) {
  return mime.toLowerCase().startsWith('image/')
}

async function fetchBrowser(page = 1) {
  browserLoading.value = true
  browserError.value = null
  try {
    const { data } = await AppiService.get<PaginatedResponse<Attachment>>('/admin/content/attachments', {
      params: { page, per_page: 16, ...(browserSearch.value ? { q: browserSearch.value } : {}) },
    })
    browserRows.value = data.data
    browserMeta.value = { total: data.meta.total, perPage: data.meta.perPage, currentPage: data.meta.currentPage }
  } catch (e: any) {
    browserError.value = e?.response?.data?.message ?? 'Error al cargar los archivos.'
  } finally {
    browserLoading.value = false
  }
}

function openBrowser() {
  selectedAttachment.value = null
  browserSearch.value = ''
  showBrowser.value = true
  fetchBrowser(1)
}

function confirmSelection() {
  if (selectedAttachment.value?.url) {
    emit('update:modelValue', selectedAttachment.value.url)
    showBrowser.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout>
watch(browserSearch, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchBrowser(1), 350)
})

// --- Direct upload ---
const uploadInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadError = ref<string | null>(null)

function triggerUpload() {
  uploadInput.value?.click()
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  uploadError.value = null
  try {
    const formData = new FormData()
    formData.append('name', file.name.replace(/\.[^.]+$/, ''))
    formData.append('file', file)
    const { data } = await AppiService.post<{ data: Attachment }>('/admin/content/attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (data.data?.url) {
      emit('update:modelValue', data.data.url)
    }
  } catch (e: any) {
    uploadError.value = e?.response?.data?.message ?? 'Error al subir el archivo.'
  } finally {
    uploading.value = false
    input.value = ''
  }
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex gap-2 items-center">
      <DuiInput
        v-model="inputValue"
        :placeholder="placeholder"
        block
        class="flex-1 min-w-0"
      />
      <DuiButton type="button" color="secondary" size="sm" title="Biblioteca de archivos" @click="openBrowser">
        <i class="mdi mdi-folder-open-outline" />
      </DuiButton>
      <DuiButton type="button" color="secondary" size="sm" :disabled="uploading" title="Subir archivo" @click="triggerUpload">
        <i v-if="uploading" class="mdi mdi-loading mdi-spin" />
        <i v-else class="mdi mdi-upload" />
      </DuiButton>
      <a v-if="modelValue" :href="modelValue" target="_blank" rel="noopener noreferrer">
        <DuiButton type="button" color="secondary" size="sm" title="Abrir en nueva ventana">
          <i class="mdi mdi-open-in-new" />
        </DuiButton>
      </a>
    </div>

    <p v-if="uploadError" class="text-xs text-red-500">{{ uploadError }}</p>

    <input
      ref="uploadInput"
      type="file"
      class="hidden"
      @change="handleFileUpload"
    />

    <!-- File browser modal -->
    <DuiModal v-model="showBrowser" size="xl" :show-close="true">
      <template #header>
        <div class="flex items-center justify-between w-full gap-4 pr-2">
          <span class="font-semibold text-slate-800 dark:text-slate-100">Biblioteca de archivos</span>
          <DuiInput v-model="browserSearch" placeholder="Buscar..." class="w-56" />
        </div>
      </template>

      <div class="min-h-[360px] flex flex-col">
        <DuiAlert v-if="browserError" color="danger" class="mb-4">{{ browserError }}</DuiAlert>

        <p v-if="browserLoading" class="text-slate-500 dark:text-slate-400 text-sm m-auto">Cargando...</p>

        <div v-else-if="browserRows.length" class="grid grid-cols-4 gap-3">
          <button
            v-for="attachment in browserRows"
            :key="attachment.id"
            type="button"
            class="browser-card"
            :class="{ 'browser-card--selected': selectedAttachment?.id === attachment.id }"
            @click="selectedAttachment = attachment"
          >
            <div class="browser-card__preview">
              <img
                v-if="isImage(attachment.mime) && attachment.url"
                :src="attachment.url"
                :alt="attachment.name"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <i v-else class="mdi mdi-file-document-outline text-3xl text-slate-400" />
            </div>
            <p class="text-xs text-center truncate px-1 pb-2 text-slate-700 dark:text-slate-300">
              {{ attachment.name }}
            </p>
          </button>
        </div>

        <div v-else class="flex flex-col items-center justify-center flex-1 gap-2 text-slate-400">
          <i class="mdi mdi-file-document-outline text-5xl" />
          <p class="text-sm">No hay archivos</p>
        </div>

        <div v-if="!browserLoading && totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p class="text-xs text-slate-500">Página {{ browserMeta.currentPage }} de {{ totalPages }}</p>
          <div class="flex gap-2">
            <DuiButton size="sm" color="secondary" :disabled="!hasPreviousPage" @click="fetchBrowser(browserMeta.currentPage - 1)">
              Anterior
            </DuiButton>
            <DuiButton size="sm" color="secondary" :disabled="!hasNextPage" @click="fetchBrowser(browserMeta.currentPage + 1)">
              Siguiente
            </DuiButton>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <DuiButton type="button" color="neutral" @click="showBrowser = false">Cancelar</DuiButton>
          <DuiButton type="button" color="primary" :disabled="!selectedAttachment" @click="confirmSelection">
            Seleccionar
          </DuiButton>
        </div>
      </template>
    </DuiModal>
  </div>
</template>

<style scoped>
.browser-card {
  border-radius: 8px;
  border: 2px solid transparent;
  background: var(--dui-color-surface, #f8fafc);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  text-align: left;
}

.browser-card:hover {
  border-color: #94a3b8;
}

.browser-card--selected {
  border-color: var(--dui-color-primary, #6366f1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dui-color-primary, #6366f1) 20%, transparent);
}

.browser-card__preview {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  overflow: hidden;
}
</style>
