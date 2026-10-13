<script setup lang="ts">
import { computed } from 'vue'
import { DuiBadge } from '@dronico/droni-kit'
import { STATUS } from '../../utils/labels'

// `status` is either a key of STATUS (e.g. 'pending', 'teacher') or a boolean
// rendered with the `on`/`off` labels. MySQL booleans arrive as 1/0, so numbers count as booleans.
const props = withDefaults(defineProps<{
  status: string | boolean | number
  on?: string
  off?: string
}>(), {
  on: 'Activo',
  off: 'Inactivo',
})

const info = computed(() => {
  if (typeof props.status !== 'string') {
    return props.status
      ? { label: props.on, color: 'success' as const }
      : { label: props.off, color: 'neutral' as const }
  }
  return STATUS[props.status] ?? { label: props.status, color: 'neutral' as const }
})
</script>

<template>
  <DuiBadge :label="info.label" :color="info.color" dot />
</template>
