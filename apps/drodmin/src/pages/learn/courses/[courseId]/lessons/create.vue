<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LearnLessonForm from '../../../../../components/learn/LearnLessonForm.vue'
import AppiService from '../../../../../services/AppiService'
import type { LearnLesson, LearnLessonFormData } from '../../../../../types/AppiService'

const route = useRoute()
const router = useRouter()
const courseId = route.params.courseId as string

const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit(data: LearnLessonFormData) {
  loading.value = true
  error.value = null
  try {
    const { data: created } = await AppiService.post<LearnLesson>(`/admin/learn/courses/${courseId}/lessons`, data)
    router.push(`/learn/courses/${courseId}/lessons/${created.id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al crear la lección.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Nueva lección</h1>
    <LearnLessonForm :course-id="courseId" :loading="loading" :error="error" @submit="handleSubmit" />
  </div>
</template>
