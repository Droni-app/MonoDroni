<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import { useTheme } from '../composables/useTheme'

if (!globalThis.MonacoEnvironment) {
  globalThis.MonacoEnvironment = {
    getWorker(_: string, label: string) {
      if (label === 'html' || label === 'handlebars' || label === 'razor') return new HtmlWorker()
      return new EditorWorker()
    },
  }
}

const languageMap: Record<string, string> = {
  markdown: 'markdown',
  html: 'html',
  plain: 'plaintext',
}

const props = withDefaults(defineProps<{
  modelValue: string | null
  language?: string
}>(), {
  language: 'markdown',
})

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const { theme } = useTheme()
const container = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(() => {
  editor = monaco.editor.create(container.value!, {
    value: props.modelValue ?? '',
    language: languageMap[props.language] ?? props.language,
    theme: theme.value === 'dark' ? 'vs-dark' : 'vs',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    wordWrap: 'on',
    scrollBeyondLastLine: false,
    padding: { top: 12, bottom: 12 },
  })

  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor!.getValue())
  })
})

onBeforeUnmount(() => {
  editor?.dispose()
})

watch(theme, (t) => {
  monaco.editor.setTheme(t === 'dark' ? 'vs-dark' : 'vs')
})

watch(() => props.language, (lang) => {
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel()!, languageMap[lang] ?? lang)
  }
})

watch(() => props.modelValue, (val) => {
  if (editor && val !== editor.getValue()) {
    editor.setValue(val ?? '')
  }
})
</script>

<template>
  <div ref="container" class="h-full w-full" />
</template>
