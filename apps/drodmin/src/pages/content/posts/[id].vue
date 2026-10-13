<script setup lang="ts">
import { useRoute } from 'vue-router'
import { DuiAlert } from '@dronico/droni-kit'
import { useFetchItem } from '../../../composables/useFetchItem'
import PageHeader from '../../../components/ui/PageHeader.vue'
import PostForm from '../../../components/content/PostForm.vue'
import type { Post } from '../../../types/AppiService'

const route = useRoute()
const { item: post, error } = useFetchItem<Post>(`/admin/content/posts/${route.params.id}`)
</script>

<template>
  <PageHeader :title="post?.name ?? 'Editar post'" :subtitle="post?.slug" back="/content/posts" />
  <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
  <PostForm v-else-if="post" :post="post" />
  <p v-else class="text-slate-500">Cargando...</p>
</template>
