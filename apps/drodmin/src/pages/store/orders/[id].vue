<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { DuiButton } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { StoreOrder } from '../../../types/AppiService'

const route = useRoute()

const order = ref<StoreOrder | null>(null)
const fetching = ref(true)
const error = ref<string | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)
const selectedStatus = ref('')

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  completed: 'Completado',
  canceled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  canceled: 'bg-red-100 text-red-800',
}

onMounted(async () => {
  try {
    const { data } = await AppiService.get<StoreOrder>(`/admin/store/orders/${route.params.id}`)
    order.value = data
    selectedStatus.value = data.status
  } catch {
    error.value = 'No se pudo cargar el pedido.'
  } finally {
    fetching.value = false
  }
})

async function updateStatus() {
  if (!order.value || selectedStatus.value === order.value.status) return
  saving.value = true
  saveError.value = null
  try {
    const { data } = await AppiService.patch<StoreOrder>(`/admin/store/orders/${route.params.id}`, {
      status: selectedStatus.value,
    })
    order.value.status = data.status
  } catch (e: any) {
    saveError.value = e?.response?.data?.message ?? 'Error al actualizar el estado.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-4xl">
    <div class="flex items-center gap-4 mb-6">
      <RouterLink to="/store/orders" class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        <i class="mdi mdi-arrow-left text-lg" />
      </RouterLink>
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Detalle del pedido</h1>
    </div>

    <p v-if="fetching" class="text-slate-500">Cargando...</p>
    <p v-else-if="error" class="text-red-500">{{ error }}</p>

    <template v-else-if="order">
      <!-- Header info -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p class="text-xs text-slate-500 mb-1">ID del pedido</p>
          <p class="font-mono text-sm break-all">{{ order.id }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p class="text-xs text-slate-500 mb-1">Cliente</p>
          <p class="font-medium">{{ order.user?.fullName ?? 'Invitado' }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p class="text-xs text-slate-500 mb-1">Total</p>
          <p class="text-xl font-bold text-slate-900 dark:text-slate-100">${{ Number(order.total).toFixed(2) }}</p>
        </div>
      </div>

      <!-- Status update -->
      <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-6">
        <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Estado del pedido</p>
        <div class="flex items-center gap-3">
          <span :class="`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[order.status] ?? ''}`">
            {{ STATUS_LABELS[order.status] ?? order.status }}
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
            :disabled="saving || selectedStatus === order.status"
            @click="updateStatus"
          >
            {{ saving ? 'Guardando...' : 'Actualizar' }}
          </DuiButton>
        </div>
        <p v-if="saveError" class="text-red-500 text-sm mt-2">{{ saveError }}</p>
      </div>

      <!-- Items -->
      <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
        <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <p class="font-medium text-slate-700 dark:text-slate-300">Productos del pedido</p>
        </div>
        <table class="w-full text-sm">
          <thead class="text-xs text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="px-4 py-2 text-left">Producto</th>
              <th class="px-4 py-2 text-right">Precio unit.</th>
              <th class="px-4 py-2 text-right">Cantidad</th>
              <th class="px-4 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in order.items ?? []"
              :key="item.id"
              class="border-b border-slate-100 dark:border-slate-700"
            >
              <td class="px-4 py-3">{{ item.product?.name ?? 'Producto eliminado' }}</td>
              <td class="px-4 py-3 text-right">${{ Number(item.price).toFixed(2) }}</td>
              <td class="px-4 py-3 text-right">{{ item.quantity }}</td>
              <td class="px-4 py-3 text-right font-medium">${{ (item.price * item.quantity).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Addresses -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div v-if="order.shippingAddress" class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dirección de envío</p>
          <pre class="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{{ JSON.stringify(order.shippingAddress, null, 2) }}</pre>
        </div>
        <div v-if="order.billingAddress" class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dirección de facturación</p>
          <pre class="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{{ JSON.stringify(order.billingAddress, null, 2) }}</pre>
        </div>
      </div>

      <!-- Payment -->
      <div v-if="order.payment" class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Información de pago</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p class="text-xs text-slate-500">Método</p>
            <p class="font-medium capitalize">{{ order.payment.paymentMethod }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500">Estado</p>
            <p class="font-medium capitalize">{{ order.payment.paymentStatus }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500">Monto</p>
            <p class="font-medium">${{ Number(order.payment.amount).toFixed(2) }} {{ order.payment.currency }}</p>
          </div>
          <div v-if="order.payment.transactionId">
            <p class="text-xs text-slate-500">Transacción</p>
            <p class="font-mono text-xs">{{ order.payment.transactionId }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
