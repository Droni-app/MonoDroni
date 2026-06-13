import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

const THEME_KEY = 'theme'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref<Theme>(getInitialTheme())

watch(theme, (value) => {
  document.documentElement.classList.toggle('dark', value === 'dark')
  localStorage.setItem(THEME_KEY, value)
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggleTheme }
}
