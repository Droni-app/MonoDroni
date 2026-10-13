<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiCard, DuiForm, DuiInput, DuiButton, DuiLabel, DuiSelect, DuiSwitch, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../services/AppiService'
import { emptyToNull, toDateTimeInput } from '../../utils/format'
import ConfirmDelete from '../ui/ConfirmDelete.vue'
import type { StoreCoupon } from '../../types/AppiService'

// Creates a coupon when `coupon` is missing, edits it otherwise.
const props = defineProps<{ coupon?: StoreCoupon }>()

const router = useRouter()
const toast = useToast()
const saving = ref(false)
const c = props.coupon

const form = reactive({
  code: c?.code ?? '',
  discount: c?.discount ?? 0,
  discount_type: c?.discountType ?? 'percentage',
  minimum_order_value: c?.minimumOrderValue ?? '',
  expiration_date: toDateTimeInput(c?.expirationDate),
  active: c ? !!c.active : true,
})

const typeOptions = [
  { label: 'Porcentaje (%)', value: 'percentage' },
  { label: 'Valor fijo ($)', value: 'fixed' },
]

async function save() {
  saving.value = true
  try {
    const payload = emptyToNull({ ...form })
    if (c) {
      await AppiService.patch(`/admin/store/coupons/${c.id}`, payload)
      toast.success('Cupón guardado.')
    } else {
      await AppiService.post('/admin/store/coupons', payload)
      toast.success('Cupón creado.')
    }
    router.push('/store/coupons')
  } catch (e) {
    toast.error(apiError(e, 'Error al guardar el cupón.'))
  } finally {
    saving.value = false
  }
}

async function remove() {
  try {
    await AppiService.delete(`/admin/store/coupons/${c!.id}`)
    toast.success('Cupón eliminado.')
    router.push('/store/coupons')
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar el cupón.'))
  }
}
</script>

<template>
  <DuiCard class="max-w-2xl">
    <DuiForm :loading="saving" @submit="save">
      <DuiLabel title="Código" required help-text="Se guarda en mayúsculas">
        <DuiInput v-model="form.code" block placeholder="DESCUENTO20" class="font-mono uppercase" required />
      </DuiLabel>
      <div class="grid gap-4 sm:grid-cols-2">
        <DuiLabel title="Tipo de descuento" required>
          <DuiSelect v-model="form.discount_type" :options="typeOptions" item-label="label" item-value="value" block />
        </DuiLabel>
        <DuiLabel :title="form.discount_type === 'percentage' ? 'Descuento (%)' : 'Descuento ($)'" required>
          <DuiInput v-model.number="form.discount" block type="number" min="0" step="0.01" required />
        </DuiLabel>
        <DuiLabel title="Pedido mínimo ($)" help-text="Opcional">
          <DuiInput v-model.number="form.minimum_order_value" block type="number" min="0" step="0.01" />
        </DuiLabel>
        <DuiLabel title="Vence" help-text="Opcional. Vacío = no vence">
          <DuiInput v-model="form.expiration_date" block type="datetime-local" />
        </DuiLabel>
      </div>
      <DuiSwitch v-model="form.active" label="Cupón activo" color="success" />
      <template #footer>
        <ConfirmDelete v-if="coupon" :action="remove" />
        <DuiButton variant="ghost" class="ml-auto" to="/store/coupons">Cancelar</DuiButton>
        <DuiButton type="submit" color="primary" :loading="saving">
          <i class="mdi mdi-content-save-outline mr-1" /> Guardar
        </DuiButton>
      </template>
    </DuiForm>
  </DuiCard>
</template>
