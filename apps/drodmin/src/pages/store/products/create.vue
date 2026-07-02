<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import StoreProductForm from '../../../components/store/StoreProductForm.vue'
import AppiService from '../../../services/AppiService'
import type { StoreProduct, StoreProductFormData } from '../../../types/AppiService'

const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit(data: StoreProductFormData) {
  loading.value = true
  error.value = null
  try {
    const { data: created } = await AppiService.post<StoreProduct>('/admin/store/products', data)
    router.push(`/store/products/${created.id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al crear el producto.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Nuevo producto</h1>
    <StoreProductForm :loading="loading" :error="error" @submit="handleSubmit" />
  </div>
</template>
