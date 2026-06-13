<template>
  <ClientOnly>
    <DuiAlert
      v-if="visible"
      :color="toast.color"
      :class="[
        'fixed bottom-4 right-4',
        typeClasses
      ]"
    >
      {{ toast.message }}
      <DuiButton
        variant="ghost"
        size="sm"
        color="secondary"
        @click="closeToast"
      >
        <i class="mdi mdi-close" />
      </DuiButton>
    </DuiAlert>
  </ClientOnly>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'
import { DuiButton, DuiAlert } from '@dronico/droni-kit'
const toast = useState('toast', () => ({
  show: false,
  message: '',
  color: 'info',
  duration: 5000,
}))

const visible = ref(false)

watchEffect(() => {
  if (toast.value.show) {
    visible.value = true
    setTimeout(() => {
      closeToast()
    }, toast.value.duration)
  }
})

const closeToast = () => {
  visible.value = false
  toast.value.show = false
}

const typeClasses = computed(() => {
  switch (toast.value.type) {
    case 'success':
      return 'bg-green-100 text-green-800 border border-green-300'
    case 'error':
      return 'bg-red-100 text-red-800 border border-red-300'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
    default:
      return 'bg-blue-100 text-blue-800 border border-blue-300'
  }
})

</script>