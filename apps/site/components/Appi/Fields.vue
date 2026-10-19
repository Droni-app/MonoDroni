<template>
  <div>
    <h5 class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">{{ title }}</h5>
    <div class="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table class="w-full text-sm">
        <tbody>
          <tr
            v-for="field in fields"
            :key="field.name"
            class="border-b last:border-b-0 border-zinc-200 dark:border-zinc-700 align-top"
          >
            <td class="px-3 py-2 whitespace-nowrap">
              <code class="font-semibold text-pink-600 dark:text-pink-400">{{ field.name }}</code>
              <span v-if="field.required" class="ml-1 text-[10px] uppercase font-bold text-rose-500">requerido</span>
            </td>
            <td class="px-3 py-2 whitespace-nowrap"><code class="text-xs text-zinc-500 dark:text-zinc-400">{{ field.type }}</code></td>
            <td class="px-3 py-2 text-zinc-600 dark:text-zinc-300 min-w-48">{{ field.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiField } from '~/data/appiDocs'

defineProps<{
  title: string
  fields: ApiField[]
}>()
</script>
