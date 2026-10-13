<script setup lang="ts">
import { ref } from 'vue'
import { DuiButton, DuiModal } from '@dronico/droni-kit'

// Delete button + confirmation modal. `action` runs on confirm; it should
// handle its own errors (e.g. show a toast).
const props = withDefaults(defineProps<{
  action: () => Promise<unknown>
  message?: string
  label?: string
  size?: 'sm' | 'md'
}>(), {
  message: '¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer.',
  label: 'Eliminar',
  size: 'md',
})

const open = ref(false)
const busy = ref(false)

async function confirm() {
  busy.value = true
  try {
    await props.action()
  } finally {
    busy.value = false
    open.value = false
  }
}
</script>

<template>
  <DuiButton type="button" color="danger" variant="outline" :size="size" :title="label" @click="open = true">
    <i class="mdi mdi-trash-can-outline" />
    <span v-if="label" class="ml-1">{{ label }}</span>
  </DuiButton>

  <DuiModal v-model="open" title="Confirmar eliminación" size="sm">
    <p class="text-slate-600 dark:text-slate-300">{{ message }}</p>
    <template #footer>
      <div class="flex justify-end gap-2">
        <DuiButton color="neutral" variant="ghost" @click="open = false">Cancelar</DuiButton>
        <DuiButton color="danger" :loading="busy" @click="confirm">Eliminar</DuiButton>
      </div>
    </template>
  </DuiModal>
</template>
