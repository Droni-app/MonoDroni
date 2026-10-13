<script setup lang="ts">
import { useRoute } from 'vue-router'
import PageHeader from '../../../../../components/ui/PageHeader.vue'
import LearnQuestionForm from '../../../../../components/learn/LearnQuestionForm.vue'

const courseId = useRoute().params.courseId as string
</script>

<template>
  <PageHeader title="Nueva pregunta" :back="`/learn/courses/${courseId}/questions`" />
  <LearnQuestionForm :course-id="courseId" />
</template>
