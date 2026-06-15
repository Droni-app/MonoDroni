type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type RegisterInput = {
  fullName: string
  email: string
  password: string
  passwordConfirmation: string
}

export function useSiteAuth() {
  const status = useState<AuthStatus>('site-auth-status', () => 'loading')
  const user = useState<User | null>('site-auth-user', () => null)
  const enrollment = useState<Enrollment | null>('site-auth-enrollment', () => null)
  const initialized = useState<boolean>('site-auth-initialized', () => false)

  const isAuthenticated = computed(() => status.value === 'authenticated')

  async function init() {
    if (initialized.value) {
      return
    }
    await refreshMe()
    initialized.value = true
  }

  async function refreshMe() {
    try {
      const data = await $fetch<Me>('/api/session/me')
      user.value = data.user
      enrollment.value = data.enrollment
      status.value = 'authenticated'
    } catch {
      user.value = null
      enrollment.value = null
      status.value = 'unauthenticated'
    }
  }

  async function login(email: string, password: string) {
    status.value = 'loading'
    const data = await $fetch<{ user: User; enrollment: Enrollment }>('/api/session/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = data.user
    enrollment.value = data.enrollment
    status.value = 'authenticated'
    initialized.value = true
  }

  async function register(payload: RegisterInput) {
    return await $fetch('/api/session/register', {
      method: 'POST',
      body: payload,
    })
  }

  async function logout() {
    await $fetch('/api/session/logout', { method: 'POST' })
    user.value = null
    enrollment.value = null
    status.value = 'unauthenticated'
    initialized.value = true
  }

  return {
    status,
    user,
    enrollment,
    isAuthenticated,
    init,
    refreshMe,
    login,
    register,
    logout,
  }
}
