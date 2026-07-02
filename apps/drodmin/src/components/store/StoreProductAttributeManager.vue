<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { DuiInput, DuiButton, DuiAlert } from '@dronico/droni-kit'
import AppiService from '../../services/AppiService'
import type { StoreProductAttribute } from '../../types/AppiService'

const props = defineProps<{ productId: string }>()

const attributes = ref<StoreProductAttribute[]>([])
const loading = ref(false)
const newAttr = reactive({ name: '', value: '' })
const creating = ref(false)
const deletingId = ref<string | null>(null)
const error = ref<string | null>(null)

async function fetchAttributes() {
  loading.value = true
  try {
    const { data } = await AppiService.get<StoreProductAttribute[]>(
      `/admin/store/products/${props.productId}/attributes`
    )
    attributes.value = data
  } catch {
    error.value = 'Error al cargar los atributos.'
  } finally {
    loading.value = false
  }
}

async function createAttribute() {
  if (!newAttr.name.trim() || !newAttr.value.trim()) return
  creating.value = true
  error.value = null
  try {
    const { data } = await AppiService.post<StoreProductAttribute>(
      `/admin/store/products/${props.productId}/attributes`,
      { name: newAttr.name.trim(), value: newAttr.value.trim() }
    )
    attributes.value.push(data)
    newAttr.name = ''
    newAttr.value = ''
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al crear el atributo.'
  } finally {
    creating.value = false
  }
}

async function deleteAttribute(id: string) {
  deletingId.value = id
  error.value = null
  try {
    await AppiService.delete(`/admin/store/products/${props.productId}/attributes/${id}`)
    attributes.value = attributes.value.filter((a) => a.id !== id)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al eliminar el atributo.'
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchAttributes)
</script>

<template>
  <div class="flex flex-col gap-3">
    <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>

    <div class="flex flex-col gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nuevo atributo</p>
      <DuiInput v-model="newAttr.name" block placeholder="Nombre (ej: Color)" />
      <DuiInput v-model="newAttr.value" block placeholder="Valor (ej: Rojo)" />
      <DuiButton
        type="button"
        color="primary"
        size="sm"
        :disabled="creating || !newAttr.name.trim() || !newAttr.value.trim()"
        @click="createAttribute"
      >
        <i class="mdi mdi-plus mr-1" />{{ creating ? 'Guardando...' : 'Agregar' }}
      </DuiButton>
    </div>

    <div v-if="loading" class="text-sm text-slate-500 dark:text-slate-400">Cargando...</div>
    <div v-else-if="attributes.length === 0" class="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
      Sin atributos
    </div>
    <div v-else class="flex flex-col gap-2">
      <div
        v-for="attr in attributes"
        :key="attr.id"
        class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      >
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{{ attr.name }}</p>
          <p class="text-sm text-slate-800 dark:text-slate-100 truncate">{{ attr.value }}</p>
        </div>
        <DuiButton
          type="button"
          size="sm"
          color="danger"
          :disabled="deletingId === attr.id"
          @click="deleteAttribute(attr.id)"
        >
          <i class="mdi mdi-trash-can" />
        </DuiButton>
      </div>
    </div>
  </div>
</template>
