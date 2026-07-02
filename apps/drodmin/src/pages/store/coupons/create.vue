<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiButton, DuiInput, DuiLabel } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { StoreCoupon } from '../../../types/AppiService'

const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)

const form = ref({
  code: '',
  discount: 0,
  discount_type: 'percentage' as 'percentage' | 'fixed',
  minimum_order_value: null as number | null,
  expiration_date: '' as string,
  active: true,
})

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    const payload = {
      ...form.value,
      minimum_order_value: form.value.minimum_order_value || null,
      expiration_date: form.value.expiration_date || null,
    }
    const { data } = await AppiService.post<StoreCoupon>('/admin/store/coupons', payload)
    router.push(`/store/coupons/${data.id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al crear el cupón.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-lg">
    <div class="flex items-center gap-4 mb-6">
      <RouterLink to="/store/coupons" class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        <i class="mdi mdi-arrow-left text-lg" />
      </RouterLink>
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Nuevo cupón</h1>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div v-if="error" class="px-4 py-3 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm">
        {{ error }}
      </div>

      <div>
        <DuiLabel>Código</DuiLabel>
        <DuiInput v-model="form.code" placeholder="DESCUENTO20" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <DuiLabel>Descuento</DuiLabel>
          <DuiInput v-model.number="form.discount" type="number" min="0" step="0.01" required />
        </div>
        <div>
          <DuiLabel>Tipo</DuiLabel>
          <select
            v-model="form.discount_type"
            class="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
          >
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Fijo ($)</option>
          </select>
        </div>
      </div>

      <div>
        <DuiLabel>Valor mínimo del pedido (opcional)</DuiLabel>
        <DuiInput v-model.number="form.minimum_order_value" type="number" min="0" step="0.01" />
      </div>

      <div>
        <DuiLabel>Fecha de vencimiento (opcional)</DuiLabel>
        <DuiInput v-model="form.expiration_date" type="datetime-local" />
      </div>

      <div class="flex items-center gap-3">
        <input id="active" v-model="form.active" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
        <label for="active" class="text-sm font-medium text-slate-700 dark:text-slate-300">Activo</label>
      </div>

      <DuiButton type="submit" color="primary" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Crear cupón' }}
      </DuiButton>
    </form>
  </div>
</template>
