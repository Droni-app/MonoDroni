<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { DuiButton } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { StorePayment } from '../../../types/AppiService'

const route = useRoute()

const payment = ref<StorePayment & { order?: any } | null>(null)
const fetching = ref(true)
const error = ref<string | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)
const selectedStatus = ref<'pending' | 'completed' | 'failed'>('pending')

const STATUS_LABELS = { pending: 'Pendiente', completed: 'Completado', failed: 'Fallido' }
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

onMounted(async () => {
  try {
    const { data } = await AppiService.get<StorePayment & { order?: any }>(`/admin/store/payments/${route.params.id}`)
    payment.value = data
    selectedStatus.value = data.paymentStatus
  } catch {
    error.value = 'No se pudo cargar el pago.'
  } finally {
    fetching.value = false
  }
})

async function updateStatus() {
  if (!payment.value || selectedStatus.value === payment.value.paymentStatus) return
  saving.value = true
  saveError.value = null
  try {
    const { data } = await AppiService.patch<StorePayment>(`/admin/store/payments/${route.params.id}`, {
      payment_status: selectedStatus.value,
    })
    payment.value.paymentStatus = data.paymentStatus
  } catch (e: any) {
    saveError.value = e?.response?.data?.message ?? 'Error al actualizar el estado.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-3xl">
    <div class="flex items-center gap-4 mb-6">
      <RouterLink to="/store/payments" class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        <i class="mdi mdi-arrow-left text-lg" />
      </RouterLink>
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Detalle del pago</h1>
    </div>

    <p v-if="fetching" class="text-slate-500">Cargando...</p>
    <p v-else-if="error" class="text-red-500">{{ error }}</p>

    <template v-else-if="payment">
      <!-- Payment info -->
      <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
        <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <p class="font-medium text-slate-700 dark:text-slate-300">Información del pago</p>
        </div>
        <div class="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-xs text-slate-500">ID</p>
            <p class="font-mono text-xs break-all">{{ payment.id }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500">Método</p>
            <p class="font-medium capitalize">{{ payment.paymentMethod }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500">Monto</p>
            <p class="font-bold text-lg">${{ Number(payment.amount).toFixed(2) }} {{ payment.currency }}</p>
          </div>
          <div v-if="payment.transactionId">
            <p class="text-xs text-slate-500">ID de transacción</p>
            <p class="font-mono text-xs">{{ payment.transactionId }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500">Fecha</p>
            <p>{{ new Date(payment.createdAt).toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <!-- Status update -->
      <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-6">
        <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Estado del pago</p>
        <div class="flex items-center gap-3">
          <span :class="`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[payment.paymentStatus] ?? ''}`">
            {{ STATUS_LABELS[payment.paymentStatus] }}
          </span>
          <select
            v-model="selectedStatus"
            class="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm"
          >
            <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
          <DuiButton
            size="sm"
            color="primary"
            :disabled="saving || selectedStatus === payment.paymentStatus"
            @click="updateStatus"
          >
            {{ saving ? 'Guardando...' : 'Actualizar' }}
          </DuiButton>
        </div>
        <p v-if="saveError" class="text-red-500 text-sm mt-2">{{ saveError }}</p>
      </div>

      <!-- Related order -->
      <div v-if="payment.order" class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p class="font-medium text-slate-700 dark:text-slate-300">Pedido asociado</p>
          <RouterLink :to="`/store/orders/${payment.order.id}`" class="text-blue-600 hover:underline text-sm">
            Ver pedido
          </RouterLink>
        </div>
        <div class="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-xs text-slate-500">ID del pedido</p>
            <p class="font-mono text-xs">{{ payment.order.id?.slice(0, 8) }}...</p>
          </div>
          <div>
            <p class="text-xs text-slate-500">Estado del pedido</p>
            <p class="font-medium capitalize">{{ payment.order.status }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500">Total del pedido</p>
            <p class="font-bold">${{ Number(payment.order.total).toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
