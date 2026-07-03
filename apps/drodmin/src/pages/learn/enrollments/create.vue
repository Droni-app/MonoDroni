<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiButton, DuiInput, DuiLabel, DuiSelect, DuiAlert, DuiCheckbox } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { LearnCourse, PaginatedResponse, SiteUser } from '../../../types/AppiService'

const router = useRouter()

// --- User picker ---
const userQuery = ref('')
const userResults = ref<SiteUser[]>([])
const searchingUsers = ref(false)
const selectedUser = ref<SiteUser | null>(null)

async function searchUsers() {
  if (!userQuery.value.trim()) return
  searchingUsers.value = true
  try {
    const { data } = await AppiService.get<SiteUser[]>('/admin/learn/site-users', {
      params: { q: userQuery.value.trim() },
    })
    userResults.value = data
  } finally {
    searchingUsers.value = false
  }
}

function onUserSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') searchUsers()
}

function selectUser(user: SiteUser) {
  selectedUser.value = user
  userResults.value = []
  userQuery.value = ''
}

// --- Role ---
const role = ref<'student' | 'teacher' | 'admin'>('student')
const roleOptions = [
  { label: 'Estudiante', value: 'student' },
  { label: 'Profesor', value: 'teacher' },
  { label: 'Admin', value: 'admin' },
]

// --- Course multi-select, filterable by group ---
const groupFilter = ref('')
const courses = ref<LearnCourse[]>([])
const loadingCourses = ref(false)
const selectedCourseIds = ref<string[]>([])

async function fetchCourses() {
  loadingCourses.value = true
  try {
    const params: Record<string, unknown> = { per_page: 100 }
    if (groupFilter.value.trim()) params.group = groupFilter.value.trim()
    const { data } = await AppiService.get<PaginatedResponse<LearnCourse>>('/admin/learn/courses', { params })
    courses.value = data.data
  } finally {
    loadingCourses.value = false
  }
}

function toggleCourse(id: string) {
  const index = selectedCourseIds.value.indexOf(id)
  if (index === -1) selectedCourseIds.value.push(id)
  else selectedCourseIds.value.splice(index, 1)
}

fetchCourses()

// --- Submit: one API call per selected course ---
const submitting = ref(false)
const results = ref<{ courseName: string; ok: boolean; message?: string }[]>([])

const canSubmit = computed(() => !!selectedUser.value && selectedCourseIds.value.length > 0 && !submitting.value)

async function handleSubmit() {
  if (!selectedUser.value) return
  submitting.value = true
  results.value = []
  for (const courseId of selectedCourseIds.value) {
    const course = courses.value.find((c) => c.id === courseId)
    try {
      await AppiService.post('/admin/learn/enrollments', {
        course_id: courseId,
        user_id: selectedUser.value.id,
        role: role.value,
        status: 'active',
      })
      results.value.push({ courseName: course?.name ?? courseId, ok: true })
    } catch (e: any) {
      results.value.push({
        courseName: course?.name ?? courseId,
        ok: false,
        message: e?.response?.data?.message ?? 'Error al inscribir.',
      })
    }
  }
  submitting.value = false
  if (results.value.every((r) => r.ok)) {
    router.push('/learn/enrollments')
  }
}
</script>

<template>
  <div class="p-6 max-w-2xl">
    <h1 class="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Inscribir usuario a cursos</h1>

    <div class="flex flex-col gap-4">
      <DuiLabel title="Usuario">
        <div v-if="selectedUser" class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
          <div class="flex-1">
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ selectedUser.fullName }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ selectedUser.email }}</p>
          </div>
          <DuiButton type="button" size="sm" color="neutral" @click="selectedUser = null">Cambiar</DuiButton>
        </div>
        <div v-else>
          <DuiInput
            v-model="userQuery"
            block
            placeholder="Buscar por nombre o email... (Enter para buscar)"
            @keydown="onUserSearchKeydown"
          />
          <div v-if="searchingUsers" class="text-sm text-slate-500 dark:text-slate-400 mt-2">Buscando...</div>
          <div v-else-if="userResults.length > 0" class="flex flex-col gap-1 mt-2">
            <button
              v-for="user in userResults"
              :key="user.id"
              type="button"
              class="text-left p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              @click="selectUser(user)"
            >
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ user.fullName }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ user.email }}</p>
            </button>
          </div>
        </div>
      </DuiLabel>

      <DuiLabel title="Rol">
        <DuiSelect v-model="role" :options="roleOptions" item-label="label" item-value="value" block />
      </DuiLabel>

      <DuiLabel title="Cursos">
        <DuiInput v-model="groupFilter" block placeholder="Filtrar por grupo..." @keydown.enter.prevent="fetchCourses" @blur="fetchCourses" />
        <div v-if="loadingCourses" class="text-sm text-slate-500 dark:text-slate-400 mt-2">Cargando cursos...</div>
        <div v-else class="flex flex-col gap-1 mt-2 max-h-64 overflow-y-auto">
          <DuiCheckbox
            v-for="course in courses"
            :key="course.id"
            :model-value="selectedCourseIds.includes(course.id)"
            :label="course.group ? `${course.name} (${course.group})` : course.name"
            @update:model-value="toggleCourse(course.id)"
          />
        </div>
      </DuiLabel>

      <div v-if="results.length > 0" class="flex flex-col gap-1">
        <DuiAlert v-for="(r, i) in results" :key="i" :color="r.ok ? 'success' : 'danger'">
          {{ r.courseName }}: {{ r.ok ? 'Inscrito correctamente' : r.message }}
        </DuiAlert>
      </div>

      <div class="flex gap-3 justify-end">
        <RouterLink to="/learn/enrollments">
          <DuiButton type="button" color="neutral">Cancelar</DuiButton>
        </RouterLink>
        <DuiButton type="button" color="primary" :disabled="!canSubmit" @click="handleSubmit">
          {{ submitting ? 'Inscribiendo...' : 'Inscribir' }}
        </DuiButton>
      </div>
    </div>
  </div>
</template>
