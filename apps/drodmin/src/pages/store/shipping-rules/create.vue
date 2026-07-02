<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiButton, DuiInput, DuiLabel } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { StoreShippingRule } from '../../../types/AppiService'

const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)

const form = ref({
  name: '',
  state_id: null as number | null,
  city_id: null as number | null,
  price: 0,
  price_per_kg: null as number | null,
  price_per_cm3: null as number | null,
  active: true,
})

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    const { data } = await AppiService.post<StoreShippingRule>('/admin/store/shipping-rules', form.value)
    router.push(`/store/shipping-rules/${data.id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al crear la regla de envío.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-lg">
    <div class="flex items-center gap-4 mb-6">
      <RouterLink to="/store/shipping-rules" class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        <i class="mdi mdi-arrow-left text-lg" />
      </RouterLink>
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Nueva regla de envío</h1>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div v-if="error" class="px-4 py-3 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm">
        {{ error }}
      </div>

      <div>
        <DuiLabel>Nombre de la regla</DuiLabel>
        <DuiInput v-model="form.name" placeholder="Ej: Envío Bogotá" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <DuiLabel>ID de estado/departamento (opcional)</DuiLabel>
          <DuiInput v-model.number="form.state_id" type="number" min="1" placeholder="ID" />
        </div>
        <div>
          <DuiLabel>ID de ciudad (opcional)</DuiLabel>
          <DuiInput v-model.number="form.city_id" type="number" min="1" placeholder="ID" />
        </div>
      </div>

      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
        <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Precios</p>
        <p class="text-xs text-slate-500">Precio final = Precio base + (peso_kg × $/kg) + (ancho×alto×prof × $/cm³)</p>
        <div>
          <DuiLabel>Precio base / fijo</DuiLabel>
          <DuiInput v-model.number="form.price" type="number" min="0" step="0.01" required />
        </div>
        <div>
          <DuiLabel>Precio por kg (opcional)</DuiLabel>
          <DuiInput v-model.number="form.price_per_kg" type="number" min="0" step="0.0001" placeholder="0.0000" />
        </div>
        <div>
          <DuiLabel>Precio por cm³ (opcional)</DuiLabel>
          <DuiInput v-model.number="form.price_per_cm3" type="number" min="0" step="0.00000001" placeholder="0.00000000" />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <input id="active" v-model="form.active" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
        <label for="active" class="text-sm font-medium text-slate-700 dark:text-slate-300">Activa</label>
      </div>

      <DuiButton type="submit" color="primary" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Crear regla' }}
      </DuiButton>
    </form>
  </div>
</template>
