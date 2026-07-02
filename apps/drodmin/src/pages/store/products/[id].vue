<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DuiButton, DuiModal } from '@dronico/droni-kit'
import StoreProductForm from '../../../components/store/StoreProductForm.vue'
import AppiService from '../../../services/AppiService'
import type { StoreProduct, StoreProductFormData } from '../../../types/AppiService'

const route = useRoute()
const router = useRouter()

const product = ref<StoreProduct | null>(null)
const loading = ref(false)
const fetching = ref(true)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)
const deleting = ref(false)

onMounted(async () => {
  try {
    const { data } = await AppiService.get<StoreProduct>(`/admin/store/products/${route.params.id}`)
    product.value = data
  } catch {
    error.value = 'No se pudo cargar el producto.'
  } finally {
    fetching.value = false
  }
})

async function handleSubmit(data: StoreProductFormData) {
  loading.value = true
  error.value = null
  try {
    await AppiService.patch(`/admin/store/products/${route.params.id}`, data)
    router.push('/store/products')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al actualizar el producto.'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await AppiService.delete(`/admin/store/products/${route.params.id}`)
    router.push('/store/products')
  } catch {
    error.value = 'Error al eliminar el producto.'
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

function toFormData(p: StoreProduct): StoreProductFormData {
  return {
    name: p.name,
    description: p.description,
    content: p.content,
    picture: p.picture,
    price: p.price,
    stock: p.stock,
    tags: p.tags ?? [],
    size_w: p.sizeW,
    size_h: p.sizeH,
    size_d: p.sizeD,
    weight: p.weight,
    active: p.active,
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Editar producto</h1>

    <p v-if="fetching" class="text-slate-500 dark:text-slate-400">Cargando...</p>

    <StoreProductForm
      v-else-if="product"
      :initial-value="toFormData(product)"
      :product-id="product.id"
      :loading="loading"
      :error="error"
      deletable
      @submit="handleSubmit"
      @delete="showDeleteModal = true"
    />

    <p v-else class="text-red-500">{{ error }}</p>

    <DuiModal v-model="showDeleteModal">
      <template #header>Eliminar producto</template>
      <p class="text-slate-600 dark:text-slate-300">
        ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <DuiButton color="neutral" @click="showDeleteModal = false">Cancelar</DuiButton>
          <DuiButton color="danger" :disabled="deleting" @click="handleDelete">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </DuiButton>
        </div>
      </template>
    </DuiModal>
  </div>
</template>
