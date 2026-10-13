<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiCard, DuiForm, DuiInput, DuiTextarea, DuiButton, DuiLabel, DuiSwitch, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../services/AppiService'
import { emptyToNull } from '../../utils/format'
import AttachmentInput from '../AttachmentInput.vue'
import AttributeManager from '../AttributeManager.vue'
import TagsInput from '../TagsInput.vue'
import ConfirmDelete from '../ui/ConfirmDelete.vue'
import type { StoreProduct } from '../../types/AppiService'

// Creates a product when `product` is missing, edits it otherwise.
const props = defineProps<{ product?: StoreProduct }>()

const router = useRouter()
const toast = useToast()
const saving = ref(false)
const p = props.product

const form = reactive({
  name: p?.name ?? '',
  description: p?.description ?? '',
  content: p?.content ?? '',
  picture: p?.picture ?? null,
  price: p?.price ?? 0,
  stock: p?.stock ?? 0,
  tags: [...(p?.tags ?? [])],
  size_w: p?.sizeW ?? '',
  size_h: p?.sizeH ?? '',
  size_d: p?.sizeD ?? '',
  weight: p?.weight ?? '',
  active: p ? !!p.active : false,
})

async function save() {
  saving.value = true
  try {
    const payload = emptyToNull({ ...form })
    if (p) {
      await AppiService.patch(`/admin/store/products/${p.id}`, payload)
      toast.success('Producto guardado.')
    } else {
      const { data } = await AppiService.post<StoreProduct>('/admin/store/products', payload)
      toast.success('Producto creado.')
      router.push(`/store/products/${data.id}`)
    }
  } catch (e) {
    toast.error(apiError(e, 'Error al guardar el producto.'))
  } finally {
    saving.value = false
  }
}

async function remove() {
  try {
    await AppiService.delete(`/admin/store/products/${p!.id}`)
    toast.success('Producto eliminado.')
    router.push('/store/products')
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar el producto.'))
  }
}
</script>

<template>
  <DuiForm :loading="saving" @submit="save">
    <div class="grid items-start gap-6 lg:grid-cols-3">
      <div class="flex flex-col gap-6 lg:col-span-2">
        <DuiCard title="Información">
          <div class="flex flex-col gap-4">
            <DuiLabel title="Nombre" required>
              <DuiInput v-model="form.name" block placeholder="Nombre del producto" required />
            </DuiLabel>
            <DuiLabel title="Descripción corta">
              <DuiTextarea v-model="form.description" block autoheight placeholder="Se muestra en los listados" />
            </DuiLabel>
            <DuiLabel title="Detalle">
              <DuiTextarea v-model="form.content" block rows="10" placeholder="Descripción extendida, especificaciones, etc." />
            </DuiLabel>
            <DuiLabel title="Tags">
              <TagsInput v-model="form.tags" />
            </DuiLabel>
          </div>
        </DuiCard>

        <DuiCard title="Envío" subtitle="Se usan para calcular el costo con las reglas de envío">
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <DuiLabel title="Ancho (cm)">
              <DuiInput v-model.number="form.size_w" block type="number" min="0" step="0.01" />
            </DuiLabel>
            <DuiLabel title="Alto (cm)">
              <DuiInput v-model.number="form.size_h" block type="number" min="0" step="0.01" />
            </DuiLabel>
            <DuiLabel title="Prof. (cm)">
              <DuiInput v-model.number="form.size_d" block type="number" min="0" step="0.01" />
            </DuiLabel>
            <DuiLabel title="Peso (kg)">
              <DuiInput v-model.number="form.weight" block type="number" min="0" step="0.001" />
            </DuiLabel>
          </div>
        </DuiCard>
      </div>

      <div class="flex flex-col gap-6">
        <DuiCard>
          <div class="flex flex-col gap-4">
            <DuiLabel title="Imagen">
              <AttachmentInput v-model="form.picture" />
            </DuiLabel>
            <div class="grid grid-cols-2 gap-4">
              <DuiLabel title="Precio" required>
                <DuiInput v-model.number="form.price" block type="number" min="0" step="0.01" required />
              </DuiLabel>
              <DuiLabel title="Stock" required>
                <DuiInput v-model.number="form.stock" block type="number" min="0" required />
              </DuiLabel>
            </div>
            <DuiSwitch v-model="form.active" label="Disponible en la tienda" color="success" />
          </div>
          <template #footer>
            <div class="flex items-center gap-2">
              <ConfirmDelete v-if="product" :action="remove" label="" />
              <DuiButton type="submit" color="primary" class="ml-auto" :loading="saving">
                <i class="mdi mdi-content-save-outline mr-1" /> Guardar
              </DuiButton>
            </div>
          </template>
        </DuiCard>

        <DuiCard v-if="product" title="Atributos" subtitle="Ej: color, talla, material">
          <AttributeManager :url="`/admin/store/products/${product.id}/attributes`" />
        </DuiCard>
      </div>
    </div>
  </DuiForm>
</template>
