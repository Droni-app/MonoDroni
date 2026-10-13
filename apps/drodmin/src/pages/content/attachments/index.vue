<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { DuiButton, DuiInput, DuiLabel, DuiModal, DuiFile, DuiPagination, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../../services/AppiService'
import { usePaginatedList } from '../../../composables/usePaginatedList'
import { formatDate, formatSize } from '../../../utils/format'
import PageHeader from '../../../components/ui/PageHeader.vue'
import ConfirmDelete from '../../../components/ui/ConfirmDelete.vue'
import EmptyState from '../../../components/ui/EmptyState.vue'
import type { Attachment } from '../../../types/AppiService'

const toast = useToast()
const q = ref('')
const { rows, loading, pagination, fetch } = usePaginatedList<Attachment>(
  '/admin/content/attachments',
  () => ({ q: q.value, per_page: 16 })
)

let searchTimer: ReturnType<typeof setTimeout>
watch(q, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetch(1), 350)
})

const isImage = (mime: string) => mime.toLowerCase().startsWith('image/')

async function copyUrl(url?: string) {
  if (!url) return
  await navigator.clipboard.writeText(url)
  toast.success('URL copiada al portapapeles.')
}

async function remove(attachment: Attachment) {
  try {
    await AppiService.delete(`/admin/content/attachments/${attachment.id}`)
    toast.success('Archivo eliminado.')
    fetch(pagination.value.page)
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar el archivo.'))
  }
}

// --- Upload ---
const showUpload = ref(false)
const uploading = ref(false)
const upload = ref<{ name: string; file: File | null }>({ name: '', file: null })

function openUpload() {
  upload.value = { name: '', file: null }
  showUpload.value = true
}

function pickFile(file: File) {
  upload.value.file = file
  if (!upload.value.name) upload.value.name = file.name.replace(/\.[^.]+$/, '')
}

async function submitUpload() {
  if (!upload.value.file) return
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('name', upload.value.name)
    formData.append('file', upload.value.file)
    await AppiService.post('/admin/content/attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    toast.success('Archivo subido.')
    showUpload.value = false
    fetch(1)
  } catch (e) {
    toast.error(apiError(e, 'Error al subir el archivo.'))
  } finally {
    uploading.value = false
  }
}

// --- Import files that already exist in the site's bucket ---
const importing = ref(false)

async function importFromBucket() {
  importing.value = true
  try {
    const { data } = await AppiService.get<{ created: number; updated: number }>('/admin/content/attachments/import')
    toast.success(`Importación lista: ${data.created} nuevos, ${data.updated} actualizados.`)
    fetch(1)
  } catch (e) {
    toast.error(apiError(e, 'Error al importar desde el bucket.'))
  } finally {
    importing.value = false
  }
}

onMounted(() => fetch())
</script>

<template>
  <PageHeader title="Archivos" subtitle="Imágenes y documentos del sitio">
    <DuiButton variant="outline" :loading="importing" title="Registra los archivos que ya están en el bucket del sitio" @click="importFromBucket">
      <i class="mdi mdi-cloud-sync-outline mr-1" /> Sincronizar bucket
    </DuiButton>
    <DuiButton color="primary" @click="openUpload">
      <i class="mdi mdi-upload mr-1" /> Subir archivo
    </DuiButton>
  </PageHeader>

  <div class="mb-6 max-w-md">
    <DuiInput v-model="q" block placeholder="Buscar por nombre..." />
  </div>

  <p v-if="loading && !rows.length" class="text-slate-500">Cargando...</p>
  <EmptyState v-else-if="!rows.length" icon="mdi-paperclip" text="No hay archivos." />

  <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" :class="{ 'opacity-60': loading }">
    <article
      v-for="attachment in rows"
      :key="attachment.id"
      class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
    >
      <a :href="attachment.url" target="_blank" rel="noopener" class="flex h-40 items-center justify-center bg-slate-100 dark:bg-slate-700">
        <img v-if="isImage(attachment.mime) && attachment.url" :src="attachment.url" :alt="attachment.name" class="h-full w-full object-cover" loading="lazy" />
        <i v-else class="mdi mdi-file-document-outline text-5xl text-slate-400" />
      </a>
      <div class="p-3">
        <p class="truncate font-medium" :title="attachment.name">{{ attachment.name }}</p>
        <p class="truncate text-xs text-slate-500 dark:text-slate-400">
          {{ attachment.mime }} · {{ formatSize(attachment.size) }} · {{ formatDate(attachment.createdAt) }}
        </p>
        <div class="mt-3 flex items-center gap-1">
          <DuiButton variant="ghost" size="sm" title="Copiar URL" @click="copyUrl(attachment.url)">
            <i class="mdi mdi-content-copy" />
          </DuiButton>
          <div class="ml-auto">
            <ConfirmDelete
              :action="() => remove(attachment)"
              :message="`¿Eliminar «${attachment.name}»? El archivo también se borrará del almacenamiento.`"
              label=""
              size="sm"
            />
          </div>
        </div>
      </div>
    </article>
  </div>

  <DuiPagination
    v-if="pagination.total > pagination.perPage"
    class="mt-6"
    :model-value="pagination.page"
    :total="pagination.total"
    :per-page="pagination.perPage"
    @update:model-value="fetch"
  />

  <DuiModal v-model="showUpload" title="Subir archivo" size="md">
    <form class="flex flex-col gap-4" @submit.prevent="submitUpload">
      <DuiLabel title="Archivo" required help-text="Máx. 10MB: imágenes, PDF, Office, zip, texto">
        <DuiFile :browser-btn="false" @upload-file="pickFile" />
      </DuiLabel>
      <DuiLabel title="Nombre" required>
        <DuiInput v-model="upload.name" block required />
      </DuiLabel>
    </form>
    <template #footer>
      <div class="flex justify-end gap-2">
        <DuiButton variant="ghost" @click="showUpload = false">Cancelar</DuiButton>
        <DuiButton color="primary" :loading="uploading" @click="submitUpload" :disabled="!upload.file">
          Subir
        </DuiButton>
      </div>
    </template>
  </DuiModal>
</template>
