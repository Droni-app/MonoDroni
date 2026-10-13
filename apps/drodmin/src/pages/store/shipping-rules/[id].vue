<script setup lang="ts">
import { useRoute } from 'vue-router'
import { DuiAlert } from '@dronico/droni-kit'
import { useFetchItem } from '../../../composables/useFetchItem'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StoreShippingRuleForm from '../../../components/store/StoreShippingRuleForm.vue'
import type { StoreShippingRule } from '../../../types/AppiService'

const route = useRoute()
const { item: rule, error } = useFetchItem<StoreShippingRule>(`/admin/store/shipping-rules/${route.params.id}`)
</script>

<template>
  <PageHeader :title="rule?.name ?? 'Editar regla de envío'" back="/store/shipping-rules" />
  <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
  <StoreShippingRuleForm v-else-if="rule" :rule="rule" />
  <p v-else class="text-slate-500">Cargando...</p>
</template>
