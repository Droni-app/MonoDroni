<script setup lang="ts">
import { useRoute } from 'vue-router'
import { DuiAlert } from '@dronico/droni-kit'
import { useFetchItem } from '../../../composables/useFetchItem'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StoreProductForm from '../../../components/store/StoreProductForm.vue'
import type { StoreProduct } from '../../../types/AppiService'

const route = useRoute()
const { item: product, error } = useFetchItem<StoreProduct>(`/admin/store/products/${route.params.id}`)
</script>

<template>
  <PageHeader :title="product?.name ?? 'Editar producto'" :subtitle="product?.slug" back="/store/products" />
  <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
  <StoreProductForm v-else-if="product" :product="product" />
  <p v-else class="text-slate-500">Cargando...</p>
</template>
