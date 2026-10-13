<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { DuiInput, DuiButton, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../services/AppiService'
import EmptyState from './ui/EmptyState.vue'

// Name/value attributes of a post or product. `url` is the attributes
// endpoint, e.g. `/admin/store/products/:id/attributes`.
const props = defineProps<{ url: string }>()

interface Attribute { id: string; name: string; value: string }

const toast = useToast()
const attributes = ref<Attribute[]>([])
const loading = ref(false)
const creating = ref(false)
const newAttr = reactive({ name: '', value: '' })

async function fetchAttributes() {
  loading.value = true
  try {
    const { data } = await AppiService.get<Attribute[]>(props.url)
    attributes.value = data
  } catch (e) {
    toast.error(apiError(e, 'Error al cargar los atributos.'))
  } finally {
    loading.value = false
  }
}

async function createAttribute() {
  if (!newAttr.name.trim() || !newAttr.value.trim()) return
  creating.value = true
  try {
    const { data } = await AppiService.post<Attribute>(props.url, {
      name: newAttr.name.trim(),
      value: newAttr.value.trim(),
    })
    attributes.value.push(data)
    newAttr.name = ''
    newAttr.value = ''
  } catch (e) {
    toast.error(apiError(e, 'Error al crear el atributo.'))
  } finally {
    creating.value = false
  }
}

async function deleteAttribute(id: string) {
  try {
    await AppiService.delete(`${props.url}/${id}`)
    attributes.value = attributes.value.filter((a) => a.id !== id)
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar el atributo.'))
  }
}

onMounted(fetchAttributes)
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Not a <form>: this component may live inside another form, so Enter is handled by hand -->
    <div class="flex gap-2">
      <DuiInput v-model="newAttr.name" block placeholder="Nombre" class="min-w-0 flex-1" @keydown.enter.prevent="createAttribute" />
      <DuiInput v-model="newAttr.value" block placeholder="Valor" class="min-w-0 flex-1" @keydown.enter.prevent="createAttribute" />
      <DuiButton color="primary" title="Agregar" :loading="creating" :disabled="!newAttr.name.trim() || !newAttr.value.trim()" @click="createAttribute">
        <i class="mdi mdi-plus" />
      </DuiButton>
    </div>

    <p v-if="loading" class="text-sm text-slate-500">Cargando...</p>
    <EmptyState v-else-if="!attributes.length" icon="mdi-tag-multiple-outline" text="Sin atributos" />
    <ul v-else class="divide-y divide-slate-200 dark:divide-slate-700">
      <li v-for="attr in attributes" :key="attr.id" class="flex items-center gap-3 py-2">
        <span class="w-1/3 truncate text-sm font-medium text-slate-500 dark:text-slate-400">{{ attr.name }}</span>
        <span class="flex-1 truncate text-sm">{{ attr.value }}</span>
        <DuiButton variant="ghost" color="danger" size="sm" title="Eliminar" @click="deleteAttribute(attr.id)">
          <i class="mdi mdi-close" />
        </DuiButton>
      </li>
    </ul>
  </div>
</template>
