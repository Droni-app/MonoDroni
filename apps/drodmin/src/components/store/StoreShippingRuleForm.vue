<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiCard, DuiForm, DuiInput, DuiButton, DuiLabel, DuiSwitch, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../services/AppiService'
import { emptyToNull } from '../../utils/format'
import ConfirmDelete from '../ui/ConfirmDelete.vue'
import type { StoreShippingRule } from '../../types/AppiService'

// Creates a shipping rule when `rule` is missing, edits it otherwise.
const props = defineProps<{ rule?: StoreShippingRule }>()

const router = useRouter()
const toast = useToast()
const saving = ref(false)
const r = props.rule

const form = reactive({
  name: r?.name ?? '',
  state_id: r?.stateId ?? '',
  city_id: r?.cityId ?? '',
  price: r?.price ?? 0,
  price_per_kg: r?.pricePerKg ?? '',
  price_per_cm3: r?.pricePerCm3 ?? '',
  active: r ? !!r.active : true,
})

async function save() {
  saving.value = true
  try {
    const payload = emptyToNull({ ...form })
    if (r) {
      await AppiService.patch(`/admin/store/shipping-rules/${r.id}`, payload)
      toast.success('Regla guardada.')
    } else {
      await AppiService.post('/admin/store/shipping-rules', payload)
      toast.success('Regla creada.')
    }
    router.push('/store/shipping-rules')
  } catch (e) {
    toast.error(apiError(e, 'Error al guardar la regla de envío.'))
  } finally {
    saving.value = false
  }
}

async function remove() {
  try {
    await AppiService.delete(`/admin/store/shipping-rules/${r!.id}`)
    toast.success('Regla eliminada.')
    router.push('/store/shipping-rules')
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar la regla.'))
  }
}
</script>

<template>
  <DuiCard class="max-w-2xl">
    <DuiForm :loading="saving" @submit="save">
      <DuiLabel title="Nombre" required>
        <DuiInput v-model="form.name" block placeholder="Ej: Envío Bogotá" required />
      </DuiLabel>

      <div>
        <p class="mb-2 text-sm font-medium">Zona</p>
        <p class="mb-3 text-xs text-slate-500">Deja ambos vacíos para una regla nacional. Si indicas ciudad, aplica solo a esa ciudad.</p>
        <div class="grid gap-4 sm:grid-cols-2">
          <DuiLabel title="ID departamento / estado">
            <DuiInput v-model.number="form.state_id" block type="number" min="1" />
          </DuiLabel>
          <DuiLabel title="ID ciudad">
            <DuiInput v-model.number="form.city_id" block type="number" min="1" />
          </DuiLabel>
        </div>
        <p v-if="rule?.state || rule?.city" class="mt-2 text-sm text-slate-500">
          Aplica a: <strong>{{ rule.city?.name ?? rule.state?.name }}</strong>
          <span v-if="rule.city && rule.state"> ({{ rule.state.name }})</span>
        </p>
      </div>

      <div>
        <p class="mb-2 text-sm font-medium">Precio</p>
        <p class="mb-3 text-xs text-slate-500">Total = base + (peso kg × $/kg) + (ancho × alto × prof. cm³ × $/cm³)</p>
        <div class="grid gap-4 sm:grid-cols-3">
          <DuiLabel title="Base ($)" required>
            <DuiInput v-model.number="form.price" block type="number" min="0" step="0.01" required />
          </DuiLabel>
          <DuiLabel title="Por kg ($)">
            <DuiInput v-model.number="form.price_per_kg" block type="number" min="0" step="0.0001" />
          </DuiLabel>
          <DuiLabel title="Por cm³ ($)">
            <DuiInput v-model.number="form.price_per_cm3" block type="number" min="0" step="any" />
          </DuiLabel>
        </div>
      </div>

      <DuiSwitch v-model="form.active" label="Regla activa" color="success" />

      <template #footer>
        <ConfirmDelete v-if="rule" :action="remove" />
        <DuiButton variant="ghost" class="ml-auto" to="/store/shipping-rules">Cancelar</DuiButton>
        <DuiButton type="submit" color="primary" :loading="saving">
          <i class="mdi mdi-content-save-outline mr-1" /> Guardar
        </DuiButton>
      </template>
    </DuiForm>
  </DuiCard>
</template>
