<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DuiButton, DuiInput, DuiLabel, DuiModal } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { StoreShippingRule } from '../../../types/AppiService'

const route = useRoute()
const router = useRouter()

const rule = ref<StoreShippingRule | null>(null)
const fetching = ref(true)
const loading = ref(false)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)
const deleting = ref(false)

const form = ref({
  name: '',
  state_id: undefined as number | undefined,
  city_id: undefined as number | undefined,
  price: 0,
  price_per_kg: undefined as number | undefined,
  price_per_cm3: undefined as number | undefined,
  active: true,
})

onMounted(async () => {
  try {
    const { data } = await AppiService.get<StoreShippingRule>(`/admin/store/shipping-rules/${route.params.id}`)
    rule.value = data
    form.value = {
      name: data.name,
      state_id: data.stateId ?? undefined,
      city_id: data.cityId ?? undefined,
      price: data.price,
      price_per_kg: data.pricePerKg ?? undefined,
      price_per_cm3: data.pricePerCm3 ?? undefined,
      active: data.active,
    }
  } catch {
    error.value = 'No se pudo cargar la regla de envío.'
  } finally {
    fetching.value = false
  }
})

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    const payload = {
      ...form.value,
      state_id: form.value.state_id ?? null,
      city_id: form.value.city_id ?? null,
      price_per_kg: form.value.price_per_kg ?? null,
      price_per_cm3: form.value.price_per_cm3 ?? null,
    }
    await AppiService.patch(`/admin/store/shipping-rules/${route.params.id}`, payload)
    router.push('/store/shipping-rules')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al actualizar la regla de envío.'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await AppiService.delete(`/admin/store/shipping-rules/${route.params.id}`)
    router.push('/store/shipping-rules')
  } catch {
    error.value = 'Error al eliminar la regla.'
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-lg">
    <div class="flex items-center gap-4 mb-6">
      <RouterLink to="/store/shipping-rules" class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        <i class="mdi mdi-arrow-left text-lg" />
      </RouterLink>
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Editar regla de envío</h1>
    </div>

    <p v-if="fetching" class="text-slate-500">Cargando...</p>
    <p v-else-if="!rule" class="text-red-500">{{ error }}</p>

    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
      <div v-if="error" class="px-4 py-3 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm">
        {{ error }}
      </div>

      <div v-if="rule.state || rule.city" class="text-sm text-slate-500 dark:text-slate-400">
        Aplica a: <strong>{{ rule.city?.name ?? rule.state?.name ?? 'Nacional' }}</strong>
        <span v-if="rule.city && rule.state"> ({{ rule.state.name }})</span>
      </div>

      <div>
        <DuiLabel>Nombre de la regla</DuiLabel>
        <DuiInput v-model="form.name" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <DuiLabel>ID de estado/departamento</DuiLabel>
          <DuiInput v-model.number="form.state_id" type="number" min="1" />
        </div>
        <div>
          <DuiLabel>ID de ciudad</DuiLabel>
          <DuiInput v-model.number="form.city_id" type="number" min="1" />
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
          <DuiInput v-model.number="form.price_per_kg" type="number" min="0" step="0.0001" />
        </div>
        <div>
          <DuiLabel>Precio por cm³ (opcional)</DuiLabel>
          <DuiInput v-model.number="form.price_per_cm3" type="number" min="0" step="0.00000001" />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <input id="active" v-model="form.active" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
        <label for="active" class="text-sm font-medium text-slate-700 dark:text-slate-300">Activa</label>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <DuiButton type="submit" color="primary" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </DuiButton>
        <DuiButton type="button" color="danger" @click="showDeleteModal = true">Eliminar</DuiButton>
      </div>
    </form>

    <DuiModal v-model="showDeleteModal">
      <template #header>Eliminar regla de envío</template>
      <p class="text-slate-600 dark:text-slate-300">¿Estás seguro de que deseas eliminar esta regla?</p>
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
