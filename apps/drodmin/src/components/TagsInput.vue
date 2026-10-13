<script setup lang="ts">
import { ref } from 'vue'
import { DuiInput, DuiBadge } from '@dronico/droni-kit'

// v-model is the list of tags. Enter or comma adds the typed tag.
const tags = defineModel<string[]>({ required: true })
const input = ref('')

function addTag() {
  const tag = input.value.trim().replace(/,+$/, '')
  if (tag && !tags.value.includes(tag)) tags.value = [...tags.value, tag]
  input.value = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div v-if="tags.length" class="flex flex-wrap gap-1">
      <DuiBadge
        v-for="tag in tags"
        :key="tag"
        :label="tag"
        color="primary"
        dismissible
        @dismiss="tags = tags.filter((t) => t !== tag)"
      />
    </div>
    <DuiInput v-model="input" block placeholder="Escribe un tag y presiona Enter" @keydown="onKeydown" @blur="addTag" />
  </div>
</template>
