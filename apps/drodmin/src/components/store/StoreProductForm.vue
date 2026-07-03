<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DuiButton,
  DuiInput,
  DuiLabel,
  DuiTextarea,
  DuiCheckbox,
  DuiAlert,
  DuiTabs,
} from '@dronico/droni-kit'
import AttachmentInput from '../AttachmentInput.vue'
import StoreProductAttributeManager from './StoreProductAttributeManager.vue'
import type { StoreProductFormData } from '../../types/AppiService'

const props = withDefaults(
  defineProps<{
    initialValue?: Partial<StoreProductFormData>
    loading?: boolean
    error?: string | null
    deletable?: boolean
    productId?: string
  }>(),
  {
    loading: false,
    error: null,
    deletable: false,
  }
)

const emit = defineEmits<{
  submit: [data: StoreProductFormData]
  delete: []
}>()

const form = ref<StoreProductFormData>({
  name: '',
  description: null,
  content: null,
  picture: null,
  price: 0,
  stock: 0,
  tags: [],
  size_w: null,
  size_h: null,
  size_d: null,
  weight: null,
  active: false,
})

const tagInput = ref('')

watch(
  () => props.initialValue,
  (val) => {
    if (!val) return
    form.value = {
      name: val.name ?? '',
      description: val.description ?? null,
      content: val.content ?? null,
      picture: val.picture ?? null,
      price: val.price ?? 0,
      stock: val.stock ?? 0,
      tags: val.tags ?? [],
      size_w: val.size_w ?? null,
      size_h: val.size_h ?? null,
      size_d: val.size_d ?? null,
      weight: val.weight ?? null,
      active: val.active ?? false,
    }
    tagInput.value = (val.tags ?? []).join(', ')
  },
  { immediate: true }
)

function addTag() {
  const tag = tagInput.value.trim().replace(/,+$/, '')
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  tagInput.value = ''
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter((t) => t !== tag)
}

function onTagKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

function handleSubmit() {
  emit('submit', { ...form.value, tags: [...form.value.tags] })
}

// DuiInput/DuiTextarea don't accept `null`, but the wire format does (to clear a field) —
// these bridge the two only at the template binding, the underlying form stays `| null`.
const descriptionModel = computed({
  get: () => form.value.description ?? undefined,
  set: (value: string | undefined) => {
    form.value.description = value ?? null
  },
})
const contentModel = computed({
  get: () => form.value.content ?? undefined,
  set: (value: string | undefined) => {
    form.value.content = value ?? null
  },
})
const sizeWModel = computed({
  get: () => form.value.size_w ?? undefined,
  set: (value: number | undefined) => {
    form.value.size_w = value ?? null
  },
})
const sizeHModel = computed({
  get: () => form.value.size_h ?? undefined,
  set: (value: number | undefined) => {
    form.value.size_h = value ?? null
  },
})
const sizeDModel = computed({
  get: () => form.value.size_d ?? undefined,
  set: (value: number | undefined) => {
    form.value.size_d = value ?? null
  },
})
const weightModel = computed({
  get: () => form.value.weight ?? undefined,
  set: (value: number | undefined) => {
    form.value.weight = value ?? null
  },
})

const activeTab = ref<'general' | 'atributos'>('general')
const tabs = [
  { value: 'general', label: 'General' },
  { value: 'atributos', label: 'Atributos' },
]
</script>

<template>
  <form class="flex gap-6 h-[calc(100vh-160px)]" @submit.prevent="handleSubmit">

    <!-- Main: description + content -->
    <div class="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto pr-1">
      <DuiLabel title="Nombre">
        <DuiInput v-model="form.name" block placeholder="Nombre del producto" required />
      </DuiLabel>

      <DuiLabel title="Descripción">
        <DuiTextarea
          v-model="descriptionModel"
          block
          :autoheight="true"
          placeholder="Descripción breve del producto"
        />
      </DuiLabel>

      <DuiLabel title="Contenido / Detalle">
        <DuiTextarea
          v-model="contentModel"
          block
          rows="10"
          placeholder="Descripción extendida, especificaciones, etc."
        />
      </DuiLabel>
    </div>

    <!-- Sidebar -->
    <div class="w-80 flex flex-col gap-4 overflow-y-auto shrink-0">

      <!-- Tabs (solo en modo edición) -->
      <DuiTabs v-if="productId" v-model="activeTab" :tabs="tabs" />

      <!-- Tab: General -->
      <template v-if="!productId || activeTab === 'general'">
        <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>

        <div class="grid grid-cols-2 gap-3">
          <DuiLabel title="Precio">
            <DuiInput v-model.number="form.price" block type="number" min="0" step="0.01" />
          </DuiLabel>
          <DuiLabel title="Stock">
            <DuiInput v-model.number="form.stock" block type="number" min="0" />
          </DuiLabel>
        </div>

        <DuiLabel title="Imagen">
          <AttachmentInput v-model="form.picture" placeholder="URL de la imagen" />
        </DuiLabel>

        <DuiLabel title="Tags">
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs"
            >
              {{ tag }}
              <button type="button" class="hover:text-red-500 transition-colors" @click="removeTag(tag)">
                <i class="mdi mdi-close text-xs" />
              </button>
            </span>
          </div>
          <DuiInput
            v-model="tagInput"
            block
            placeholder="Escribe un tag y presiona Enter"
            @keydown="onTagKeydown"
            @blur="addTag"
          />
        </DuiLabel>

        <div>
          <p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Dimensiones (cm)</p>
          <div class="grid grid-cols-3 gap-2">
            <DuiLabel title="Ancho">
              <DuiInput v-model.number="sizeWModel" block type="number" min="0" step="0.01" />
            </DuiLabel>
            <DuiLabel title="Alto">
              <DuiInput v-model.number="sizeHModel" block type="number" min="0" step="0.01" />
            </DuiLabel>
            <DuiLabel title="Prof.">
              <DuiInput v-model.number="sizeDModel" block type="number" min="0" step="0.01" />
            </DuiLabel>
          </div>
        </div>

        <DuiLabel title="Peso (kg)">
          <DuiInput v-model.number="weightModel" block type="number" min="0" step="0.001" />
        </DuiLabel>

        <div>
          <DuiCheckbox v-model="form.active" label="Activo" color="primary" />
        </div>

        <div class="flex gap-3 mt-auto pt-4">
          <DuiButton v-if="deletable" type="button" color="danger" @click="emit('delete')">
            <i class="mdi mdi-delete" />
          </DuiButton>
          <div class="flex gap-3 justify-end flex-1">
            <RouterLink to="/store/products">
              <DuiButton type="button" color="neutral">Cancelar</DuiButton>
            </RouterLink>
            <DuiButton type="submit" color="primary" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </DuiButton>
          </div>
        </div>
      </template>

      <!-- Tab: Atributos -->
      <StoreProductAttributeManager
        v-if="productId && activeTab === 'atributos'"
        :product-id="productId"
      />

    </div>

  </form>
</template>
