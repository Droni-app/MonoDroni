<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiCard, DuiInput, DuiLabel, DuiButton, DuiAlert } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'

const router = useRouter()
const name = ref('')
const file = ref<File | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
  if (file.value && !name.value) {
    name.value = file.value.name.replace(/\.[^.]+$/, '')
  }
}

async function handleSubmit() {
  if (!file.value) {
    error.value = 'Selecciona un archivo.'
    return
  }
  error.value = null
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('name', name.value)
    formData.append('file', file.value)
    await AppiService.post('/admin/content/attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    router.push('/content/attachments')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al subir el archivo.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center gap-3 mb-6">
      <RouterLink to="/content/attachments">
        <DuiButton color="secondary" size="sm">
          <i class="mdi mdi-arrow-left" />
        </DuiButton>
      </RouterLink>
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Subir archivo</h1>
    </div>
    <DuiCard>
      <form @submit.prevent="handleSubmit">
        <DuiAlert v-if="error" color="danger" class="mb-4">{{ error }}</DuiAlert>
        <DuiLabel title="Nombre">
          <DuiInput v-model="name" :block="true" required />
        </DuiLabel>
        <DuiLabel title="Archivo">
          <input
            type="file"
            class="file-input"
            required
            @change="handleFileChange"
          />
        </DuiLabel>
        <div class="flex gap-3 mt-4">
          <DuiButton type="submit" color="primary" :loading="loading">
            <i class="mdi mdi-upload mr-1" /> Subir
          </DuiButton>
          <RouterLink to="/content/attachments">
            <DuiButton type="button" color="secondary">Cancelar</DuiButton>
          </RouterLink>
        </div>
      </form>
    </DuiCard>
  </div>
</template>

<style scoped>
.file-input {
  display: block;
  width: 100%;
  padding: 8px;
  border: 1px solid var(--dui-color-border, #e2e8f0);
  border-radius: 6px;
  background: var(--dui-color-surface, #fff);
  color: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}

.file-input:focus {
  outline: 2px solid var(--dui-color-primary, #6366f1);
  outline-offset: 2px;
}
</style>
