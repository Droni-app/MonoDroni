<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { DuiCard, DuiAlert, DuiButton, DuiSelect, DuiTable, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../../services/AppiService'
import { useFetchItem } from '../../../composables/useFetchItem'
import { formatDateTime, formatMoney } from '../../../utils/format'
import { ORDER_STATUSES } from '../../../utils/labels'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../components/ui/StatusBadge.vue'
import UserAvatar from '../../../components/ui/UserAvatar.vue'
import type { StoreOrder } from '../../../types/AppiService'

const route = useRoute()
const toast = useToast()
const url = `/admin/store/orders/${route.params.id}`
const { item: order, error } = useFetchItem<StoreOrder>(url)

const status = ref('')
const saving = ref(false)
watch(order, (o) => { if (o) status.value = o.status })

async function updateStatus() {
  saving.value = true
  try {
    const { data } = await AppiService.patch<StoreOrder>(url, { status: status.value })
    order.value!.status = data.status
    toast.success('Estado del pedido actualizado.')
  } catch (e) {
    toast.error(apiError(e, 'Error al actualizar el estado.'))
  } finally {
    saving.value = false
  }
}

// Addresses are free-form JSON; show them as a list of fields.
function addressFields(address: unknown): Record<string, unknown> {
  if (typeof address === 'string') {
    try { return JSON.parse(address) } catch { return { dirección: address } }
  }
  return (address ?? {}) as Record<string, unknown>
}

const addresses = computed(() => [
  { title: 'Dirección de envío', value: order.value?.shippingAddress },
  { title: 'Dirección de facturación', value: order.value?.billingAddress },
])

const itemColumns = [
  { label: 'Producto', name: 'product' },
  { label: 'Precio', name: 'price', classes: 'text-right' },
  { label: 'Cant.', name: 'quantity', classes: 'text-right' },
  { label: 'Subtotal', name: 'subtotal', classes: 'text-right' },
]
</script>

<template>
  <PageHeader :title="order ? `Pedido #${order.id.slice(0, 8)}` : 'Pedido'" :subtitle="formatDateTime(order?.createdAt)" back="/store/orders" />

  <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
  <p v-else-if="!order" class="text-slate-500">Cargando...</p>

  <div v-else class="grid items-start gap-6 lg:grid-cols-3">
    <div class="flex flex-col gap-6 lg:col-span-2">
      <DuiCard title="Productos">
        <DuiTable :columns="itemColumns" :rows="order.items ?? []">
          <template #product="{ product }">{{ product?.name ?? 'Producto eliminado' }}</template>
          <template #price="{ price }"><span class="block text-right">{{ formatMoney(price) }}</span></template>
          <template #quantity="{ quantity }"><span class="block text-right">{{ quantity }}</span></template>
          <template #subtotal="{ price, quantity }">
            <span class="block text-right font-medium">{{ formatMoney(price * quantity) }}</span>
          </template>
        </DuiTable>
        <p class="mt-4 text-right text-lg">Total: <strong>{{ formatMoney(order.total) }}</strong></p>
      </DuiCard>

      <DuiCard title="Pagos">
        <p v-if="!order.payments?.length" class="text-sm text-slate-400">Sin pagos registrados.</p>
        <ul class="divide-y divide-slate-200 dark:divide-slate-700">
          <li v-for="payment in order.payments" :key="payment.id" class="flex flex-wrap items-center gap-3 py-3 text-sm">
            <StatusBadge :status="payment.paymentStatus" />
            <span class="capitalize">{{ payment.paymentMethod }}</span>
            <span class="font-medium">{{ formatMoney(payment.amount) }} {{ payment.currency }}</span>
            <span class="text-xs text-slate-400">{{ formatDateTime(payment.createdAt) }}</span>
            <DuiButton variant="ghost" size="sm" class="ml-auto" :to="`/store/payments/${payment.id}`">Ver pago</DuiButton>
          </li>
        </ul>
      </DuiCard>
    </div>

    <div class="flex flex-col gap-6">
      <DuiCard title="Estado">
        <div class="flex flex-col gap-3">
          <StatusBadge :status="order.status" />
          <DuiSelect v-model="status" :options="ORDER_STATUSES" item-label="label" item-value="value" block />
          <DuiButton color="primary" block :loading="saving" :disabled="status === order.status" @click="updateStatus">
            Actualizar estado
          </DuiButton>
        </div>
      </DuiCard>

      <DuiCard title="Cliente">
        <UserAvatar :user="order.user" size="md" />
      </DuiCard>

      <DuiCard v-for="address in addresses" :key="address.title" :title="address.title">
        <p v-if="!address.value" class="text-sm text-slate-400">No registrada.</p>
        <dl v-else class="grid grid-cols-3 gap-x-2 gap-y-1 text-sm">
          <template v-for="(value, key) in addressFields(address.value)" :key="key">
            <dt class="capitalize text-slate-500">{{ String(key).replace(/_/g, ' ') }}</dt>
            <dd class="col-span-2 break-words">{{ value }}</dd>
          </template>
        </dl>
      </DuiCard>
    </div>
  </div>
</template>
