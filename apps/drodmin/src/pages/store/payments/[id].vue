<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { DuiCard, DuiAlert, DuiButton, DuiSelect, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../../services/AppiService'
import { useFetchItem } from '../../../composables/useFetchItem'
import { formatDateTime, formatMoney } from '../../../utils/format'
import { PAYMENT_STATUSES } from '../../../utils/labels'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StatusBadge from '../../../components/ui/StatusBadge.vue'
import type { StorePayment } from '../../../types/AppiService'

const route = useRoute()
const toast = useToast()
const url = `/admin/store/payments/${route.params.id}`
const { item: payment, error } = useFetchItem<StorePayment>(url)

const status = ref('')
const saving = ref(false)
watch(payment, (p) => { if (p) status.value = p.paymentStatus })

async function updateStatus() {
  saving.value = true
  try {
    const { data } = await AppiService.patch<StorePayment>(url, { payment_status: status.value })
    payment.value!.paymentStatus = data.paymentStatus
    toast.success('Estado del pago actualizado.')
  } catch (e) {
    toast.error(apiError(e, 'Error al actualizar el estado.'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <PageHeader title="Pago" :subtitle="formatDateTime(payment?.createdAt)" back="/store/payments" />

  <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
  <p v-else-if="!payment" class="text-slate-500">Cargando...</p>

  <div v-else class="grid items-start gap-6 lg:grid-cols-3">
    <div class="flex flex-col gap-6 lg:col-span-2">
      <DuiCard title="Detalle">
        <dl class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt class="text-slate-500">Monto</dt>
            <dd class="text-2xl font-bold">{{ formatMoney(payment.amount) }} <span class="text-sm font-normal">{{ payment.currency }}</span></dd>
          </div>
          <div>
            <dt class="text-slate-500">Método</dt>
            <dd class="capitalize">{{ payment.paymentMethod }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">ID de transacción</dt>
            <dd class="break-all font-mono text-xs">{{ payment.transactionId ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">ID del pago</dt>
            <dd class="break-all font-mono text-xs">{{ payment.id }}</dd>
          </div>
        </dl>
      </DuiCard>

      <DuiCard v-if="payment.order" title="Pedido asociado">
        <div class="flex flex-wrap items-center gap-4 text-sm">
          <span class="font-mono">#{{ payment.order.id.slice(0, 8) }}</span>
          <StatusBadge :status="payment.order.status" />
          <span class="font-medium">{{ formatMoney(payment.order.total) }}</span>
          <DuiButton variant="outline" size="sm" class="ml-auto" :to="`/store/orders/${payment.order.id}`">Ver pedido</DuiButton>
        </div>
        <ul v-if="payment.order.items?.length" class="mt-4 divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <li v-for="item in payment.order.items" :key="item.id" class="flex justify-between py-2">
            <span>{{ item.quantity }} × {{ item.product?.name ?? 'Producto eliminado' }}</span>
            <span>{{ formatMoney(item.price * item.quantity) }}</span>
          </li>
        </ul>
      </DuiCard>
    </div>

    <DuiCard title="Estado">
      <div class="flex flex-col gap-3">
        <StatusBadge :status="payment.paymentStatus" />
        <DuiSelect v-model="status" :options="PAYMENT_STATUSES" item-label="label" item-value="value" block />
        <DuiButton color="primary" block :loading="saving" :disabled="status === payment.paymentStatus" @click="updateStatus">
          Actualizar estado
        </DuiButton>
      </div>
    </DuiCard>
  </div>
</template>
