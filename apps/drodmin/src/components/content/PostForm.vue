<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiCard, DuiForm, DuiInput, DuiTextarea, DuiButton, DuiLabel, DuiSelect, DuiSwitch, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../services/AppiService'
import MonacoEditor from '../MonacoEditor.vue'
import AttachmentInput from '../AttachmentInput.vue'
import AttributeManager from '../AttributeManager.vue'
import TagsInput from '../TagsInput.vue'
import ConfirmDelete from '../ui/ConfirmDelete.vue'
import type { Post } from '../../types/AppiService'

// Creates a post when `post` is missing, edits it otherwise.
const props = defineProps<{ post?: Post }>()

const router = useRouter()
const toast = useToast()
const saving = ref(false)

const form = reactive({
  name: props.post?.name ?? '',
  description: props.post?.description ?? '',
  tags: [...(props.post?.tags ?? [])],
  picture: props.post?.picture ?? null,
  content: props.post?.content ?? '',
  format: props.post?.format ?? 'markdown',
  active: !!props.post?.active,
})

const formatOptions = [
  { label: 'Markdown', value: 'markdown' },
  { label: 'HTML', value: 'html' },
  { label: 'Texto plano', value: 'plaintext' },
]

async function save() {
  saving.value = true
  try {
    const payload = { ...form, content: form.content || null }
    if (props.post) {
      await AppiService.patch(`/admin/content/posts/${props.post.id}`, payload)
      toast.success('Post guardado.')
    } else {
      const { data } = await AppiService.post<Post>('/admin/content/posts', payload)
      toast.success('Post creado.')
      router.push(`/content/posts/${data.id}`)
    }
  } catch (e) {
    toast.error(apiError(e, 'Error al guardar el post.'))
  } finally {
    saving.value = false
  }
}

async function remove() {
  try {
    await AppiService.delete(`/admin/content/posts/${props.post!.id}`)
    toast.success('Post eliminado.')
    router.push('/content/posts')
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar el post.'))
  }
}
</script>

<template>
  <DuiForm :loading="saving" @submit="save">
    <div class="grid items-start gap-6 lg:grid-cols-3">
      <div class="h-[75vh] overflow-hidden rounded-xl border border-slate-200 lg:col-span-2 dark:border-slate-700">
        <MonacoEditor v-model="form.content" :language="form.format" />
      </div>

      <div class="flex flex-col gap-6">
        <DuiCard>
          <div class="flex flex-col gap-4">
            <DuiLabel title="Nombre" required>
              <DuiInput v-model="form.name" block placeholder="Título del post" required />
            </DuiLabel>
            <DuiLabel title="Descripción">
              <DuiTextarea v-model="form.description" block autoheight placeholder="Resumen breve" />
            </DuiLabel>
            <DuiLabel title="Imagen">
              <AttachmentInput v-model="form.picture" />
            </DuiLabel>
            <DuiLabel title="Tags">
              <TagsInput v-model="form.tags" />
            </DuiLabel>
            <DuiLabel title="Formato">
              <DuiSelect v-model="form.format" :options="formatOptions" item-label="label" item-value="value" block />
            </DuiLabel>
            <DuiSwitch v-model="form.active" label="Publicado" color="success" />
          </div>
          <template #footer>
            <div class="flex items-center gap-2">
              <ConfirmDelete v-if="post" :action="remove" label="" />
              <DuiButton type="submit" color="primary" class="ml-auto" :loading="saving">
                <i class="mdi mdi-content-save-outline mr-1" /> Guardar
              </DuiButton>
            </div>
          </template>
        </DuiCard>

        <DuiCard v-if="post" title="Atributos">
          <AttributeManager :url="`/admin/content/posts/${post.id}/attributes`" />
        </DuiCard>
      </div>
    </div>
  </DuiForm>
</template>
