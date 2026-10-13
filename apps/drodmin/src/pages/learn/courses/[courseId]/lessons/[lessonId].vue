<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { DuiAlert, DuiCard, DuiTabs } from '@dronico/droni-kit'
import { useFetchItem } from '../../../../../composables/useFetchItem'
import PageHeader from '../../../../../components/ui/PageHeader.vue'
import LearnLessonForm from '../../../../../components/learn/LearnLessonForm.vue'
import LearnLessonQuestionsManager from '../../../../../components/learn/LearnLessonQuestionsManager.vue'
import LearnLessonAnswersManager from '../../../../../components/learn/LearnLessonAnswersManager.vue'
import LearnLessonQuizzesManager from '../../../../../components/learn/LearnLessonQuizzesManager.vue'
import type { LearnLesson } from '../../../../../types/AppiService'

const route = useRoute()
const courseId = route.params.courseId as string
const lessonId = route.params.lessonId as string
const { item: lesson, error } = useFetchItem<LearnLesson>(`/admin/learn/courses/${courseId}/lessons/${lessonId}`)

const tab = ref('questions')
const tabs = [
  { value: 'questions', label: 'Preguntas del examen' },
  { value: 'answers', label: 'Respuestas de la actividad' },
  { value: 'quizzes', label: 'Intentos de examen' },
]
</script>

<template>
  <PageHeader :title="lesson?.name ?? 'Editar lección'" :subtitle="lesson?.slug" :back="`/learn/courses/${courseId}/lessons`" />
  <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
  <p v-else-if="!lesson" class="text-slate-500">Cargando...</p>

  <div v-else class="flex flex-col gap-6">
    <LearnLessonForm :course-id="courseId" :lesson="lesson" />

    <DuiCard>
      <DuiTabs v-model="tab" :tabs="tabs" class="mb-4" />
      <LearnLessonQuestionsManager v-if="tab === 'questions'" :course-id="courseId" :lesson-id="lessonId" />
      <LearnLessonAnswersManager v-if="tab === 'answers'" :course-id="courseId" :lesson-id="lessonId" />
      <LearnLessonQuizzesManager v-if="tab === 'quizzes'" :course-id="courseId" :lesson-id="lessonId" />
    </DuiCard>
  </div>
</template>
