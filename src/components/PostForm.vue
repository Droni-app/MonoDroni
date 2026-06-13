<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { DuiInput, DuiTextarea, DuiButton, DuiLabel, DuiSelect, DuiCheckbox, DuiAlert, DuiTabs } from '@dronico/droni-kit'
import MonacoEditor from './MonacoEditor.vue'
import AttributeManager from './content/posts/AttributeManager.vue'
import type { PostFormData } from '../types/AppiService'

const props = withDefaults(defineProps<{
  initialValue?: Partial<PostFormData>
  loading?: boolean
  error?: string | null
  deletable?: boolean
  postId?: string
}>(), {
  loading: false,
  error: null,
  deletable: false,
})

const emit = defineEmits<{
  submit: [PostFormData]
  delete: []
}>()

const form = reactive<PostFormData>({
  name: props.initialValue?.name ?? '',
  description: props.initialValue?.description ?? '',
  tags: props.initialValue?.tags ? [...props.initialValue.tags] : [],
  picture: props.initialValue?.picture ?? null,
  content: props.initialValue?.content ?? '',
  format: props.initialValue?.format ?? 'markdown',
  active: props.initialValue?.active ?? false,
})

const formatOptions = [
  { label: 'Markdown', value: 'markdown' },
  { label: 'HTML', value: 'html' },
  { label: 'Texto plano', value: 'plain' },
]

const tagInput = ref('')

function addTag() {
  const tag = tagInput.value.trim().replace(/,+$/, '')
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
  }
  tagInput.value = ''
}

function removeTag(tag: string) {
  form.tags = form.tags.filter(t => t !== tag)
}

function onTagKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

function handleSubmit() {
  emit('submit', { ...form, tags: [...form.tags] })
}

const editorContent = computed({
  get: () => form.content ?? '',
  set: (val) => { form.content = val },
})

const activeTab = ref<'general' | 'atributos'>('general')

const tabs = [
  { value: 'general', label: 'General' },
  { value: 'atributos', label: 'Atributos' },
]
</script>

<template>
  <form class="flex gap-6 h-[calc(100vh-160px)]" @submit.prevent="handleSubmit">

    <!-- Main: Monaco Editor -->
    <div class="flex-1 min-w-0 flex flex-col gap-2">
      <div class="flex-1 rounded overflow-hidden border border-slate-200 dark:border-slate-700" style="height: calc(100vh - 160px)">
        <MonacoEditor v-model="editorContent" :language="form.format" class="h-full" />
      </div>
    </div>

    <!-- Sidebar -->
    <div class="w-80 flex flex-col gap-4 overflow-y-auto shrink-0">

      <!-- Tabs (solo en modo edición) -->
      <DuiTabs v-if="postId" v-model="activeTab" :tabs="tabs" />

      <!-- Tab: General -->
      <template v-if="!postId || activeTab === 'general'">
        <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>

        <DuiLabel title="Nombre">
          <DuiInput v-model="form.name" block placeholder="Nombre del post" />
        </DuiLabel>

        <DuiLabel title="Descripción">
          <DuiTextarea v-model="form.description" block :autoheight="true" placeholder="Descripción breve" />
        </DuiLabel>

        <DuiLabel title="Tags">
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs"
            >
              {{ tag }}
              <button type="button" class="hover:text-red-500 transition-colors" @click="removeTag(tag)">
                <i class="mdi mdi-close text-xs" />
              </button>
            </span>
          </div>
          <DuiInput
            v-model="tagInput"
            block
            placeholder="Escribe un tag y presiona Enter"
            @keydown="onTagKeydown"
            @blur="addTag"
          />
        </DuiLabel>

        <DuiLabel title="Formato">
          <DuiSelect
            v-model="form.format"
            :options="formatOptions"
            item-label="label"
            item-value="value"
            block
          />
        </DuiLabel>

        <div>
          <DuiCheckbox v-model="form.active" label="Activo" color="primary" />
        </div>

        <div class="flex gap-3 mt-auto pt-4">
          <DuiButton v-if="deletable" type="button" color="danger" @click="emit('delete')">
            <i class="mdi mdi-delete" />
          </DuiButton>
          <div class="flex gap-3 justify-end flex-1">
            <RouterLink to="/content/posts">
              <DuiButton type="button" color="neutral">Cancelar</DuiButton>
            </RouterLink>
            <DuiButton type="submit" color="primary" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </DuiButton>
          </div>
        </div>
      </template>

      <!-- Tab: Atributos -->
      <AttributeManager v-if="postId && activeTab === 'atributos'" :post-id="postId" />

    </div>

  </form>
</template>
