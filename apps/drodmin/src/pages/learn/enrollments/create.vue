<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiCard, DuiButton, DuiInput, DuiLabel, DuiSelect, DuiAlert, DuiCheckbox } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../../services/AppiService'
import { ENROLLMENT_ROLES } from '../../../utils/labels'
import PageHeader from '../../../components/ui/PageHeader.vue'
import UserPicker from '../../../components/learn/UserPicker.vue'
import type { LearnCourse, PaginatedResponse, SiteUser } from '../../../types/AppiService'

// Enrolls one user into several courses at once (one API call per course).
const router = useRouter()

const user = ref<SiteUser | null>(null)
const role = ref('student')

// --- Courses, filterable by group ---
const group = ref('')
const courses = ref<LearnCourse[]>([])
const loadingCourses = ref(false)
const selectedIds = ref<string[]>([])

async function fetchCourses() {
  loadingCourses.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<LearnCourse>>('/admin/learn/courses', {
      params: { per_page: 200, group: group.value.trim() || undefined },
    })
    courses.value = data.data
  } finally {
    loadingCourses.value = false
  }
}
fetchCourses()

function selectAll() {
  selectedIds.value = courses.value.map((c) => c.id)
}

// --- Submit ---
const submitting = ref(false)
const results = ref<{ course: string; ok: boolean; message?: string }[]>([])
const canSubmit = computed(() => !!user.value && selectedIds.value.length > 0)

async function submit() {
  submitting.value = true
  results.value = []
  for (const id of selectedIds.value) {
    const course = courses.value.find((c) => c.id === id)?.name ?? id
    try {
      await AppiService.post('/admin/learn/enrollments', { course_id: id, user_id: user.value!.id, role: role.value, status: 'active' })
      results.value.push({ course, ok: true })
    } catch (e) {
      results.value.push({ course, ok: false, message: apiError(e, 'Error al inscribir.') })
    }
  }
  submitting.value = false
  if (results.value.every((r) => r.ok)) router.push('/learn/enrollments')
}
</script>

<template>
  <PageHeader title="Inscribir usuario" subtitle="Inscribe a un usuario en uno o varios cursos" back="/learn/enrollments" />

  <div class="grid items-start gap-6 lg:grid-cols-3">
    <DuiCard title="1. Usuario y rol">
      <div class="flex flex-col gap-4">
        <DuiLabel title="Usuario" required>
          <UserPicker v-model="user" />
        </DuiLabel>
        <DuiLabel title="Rol en los cursos">
          <DuiSelect v-model="role" :options="ENROLLMENT_ROLES" item-label="label" item-value="value" block />
        </DuiLabel>
      </div>
    </DuiCard>

    <DuiCard title="2. Cursos" class="lg:col-span-2">
      <div class="flex flex-col gap-4">
        <div class="flex gap-2">
          <DuiInput v-model="group" block placeholder="Filtrar por grupo" class="flex-1" @keydown.enter.prevent="fetchCourses" />
          <DuiButton title="Filtrar" @click="fetchCourses"><i class="mdi mdi-filter-outline" /></DuiButton>
          <DuiButton variant="ghost" @click="selectAll">Seleccionar todos</DuiButton>
        </div>
        <p v-if="loadingCourses" class="text-sm text-slate-500">Cargando cursos...</p>
        <div v-else class="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
          <DuiCheckbox
            v-for="course in courses"
            :key="course.id"
            v-model="selectedIds"
            :value="course.id"
            :label="course.group ? `${course.name} · ${course.group}` : course.name"
          />
        </div>

        <div v-if="results.length" class="flex flex-col gap-2">
          <DuiAlert v-for="r in results" :key="r.course" :color="r.ok ? 'success' : 'danger'">
            {{ r.course }}: {{ r.ok ? 'inscrito' : r.message }}
          </DuiAlert>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">{{ selectedIds.length }} curso(s) seleccionado(s)</span>
          <DuiButton color="primary" class="ml-auto" :loading="submitting" :disabled="!canSubmit" @click="submit">
            <i class="mdi mdi-account-plus-outline mr-1" /> Inscribir
          </DuiButton>
        </div>
      </template>
    </DuiCard>
  </div>
</template>
