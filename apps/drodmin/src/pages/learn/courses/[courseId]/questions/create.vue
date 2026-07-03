<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LearnQuestionForm from '../../../../../components/learn/LearnQuestionForm.vue'
import AppiService from '../../../../../services/AppiService'
import type { LearnQuestion, LearnQuestionFormData } from '../../../../../types/AppiService'

const route = useRoute()
const router = useRouter()
const courseId = route.params.courseId as string

const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit(data: LearnQuestionFormData) {
  loading.value = true
  error.value = null
  try {
    const { data: created } = await AppiService.post<LearnQuestion>(
      `/admin/learn/courses/${courseId}/questions`,
      data
    )
    router.push(`/learn/courses/${courseId}/questions/${created.id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al crear la pregunta.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Nueva pregunta</h1>
    <LearnQuestionForm :course-id="courseId" :loading="loading" :error="error" @submit="handleSubmit" />
  </div>
</template>
