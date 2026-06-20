<template>
  <section class="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <CodelabMiniSectionHeader icon="mdi-lock" color="rose" title="Generador de Contraseñas">
      Genera contraseñas seguras con criterios personalizables usando <code class="font-mono text-xs">crypto.getRandomValues</code>.
    </CodelabMiniSectionHeader>

    <!-- Options -->
    <div class="flex flex-col gap-4 mb-5">

      <!-- Length -->
      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-20 flex-shrink-0">Longitud</label>
        <input
          v-model.number="length"
          type="range"
          min="8"
          max="64"
          class="flex-1 accent-rose-500"
        >
        <span class="w-8 text-center font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ length }}</span>
      </div>

      <!-- Character sets -->
      <div class="grid grid-cols-2 gap-x-6 gap-y-2">
        <label v-for="opt in charOptions" :key="opt.key" class="flex items-center gap-2 cursor-pointer select-none">
          <input v-model="opt.enabled" type="checkbox" class="rounded accent-rose-500">
          <span class="text-sm text-zinc-700 dark:text-zinc-300">{{ opt.label }}</span>
          <code class="ml-auto font-mono text-xs text-zinc-400 dark:text-zinc-500">{{ opt.sample }}</code>
        </label>
      </div>

      <!-- Exclude ambiguous -->
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input v-model="excludeAmbiguous" type="checkbox" class="rounded accent-rose-500">
        <span class="text-sm text-zinc-700 dark:text-zinc-300">Excluir caracteres ambiguos</span>
        <code class="ml-2 font-mono text-xs text-zinc-400 dark:text-zinc-500">I l 1 O 0 | ` ' "</code>
      </label>
    </div>

    <!-- Output -->
    <div class="flex gap-2 mb-3">
      <div class="flex-1 relative">
        <input
          :value="password"
          :type="showPassword ? 'text' : 'password'"
          readonly
          placeholder="Haz clic en Generar…"
          class="w-full rounded-lg px-3 py-2.5 font-mono text-sm bg-zinc-100 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 pr-10 focus:outline-none"
        >
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          :title="showPassword ? 'Ocultar' : 'Mostrar'"
          @click="showPassword = !showPassword"
        >
          <i :class="`mdi ${showPassword ? 'mdi-eye-off' : 'mdi-eye'} text-lg`" />
        </button>
      </div>
      <DuiButton size="sm" variant="outline" :disabled="!password" @click="copyPassword">
        <i :class="`mdi ${copiedPassword ? 'mdi-check text-emerald-500' : 'mdi-content-copy'}`" />
      </DuiButton>
      <DuiButton size="sm" color="primary" @click="generate">
        <i class="mdi mdi-refresh" /> Generar
      </DuiButton>
    </div>

    <!-- Strength bar -->
    <div v-if="password" class="flex items-center gap-3">
      <div class="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="strength.barColor"
          :style="{ width: `${strength.pct}%` }"
        />
      </div>
      <span class="text-xs font-semibold w-20 text-right" :class="strength.textColor">{{ strength.label }}</span>
    </div>
    <p v-if="noCharsetError" class="mt-2 text-sm text-red-500 dark:text-red-400">
      Selecciona al menos un tipo de carácter.
    </p>
  </section>
</template>

<script setup lang="ts">
import { DuiButton } from '@dronico/droni-kit'

const AMBIGUOUS = new Set([...'Il1O0|`\'"'])

const charOptions = reactive([
  { key: 'upper',   label: 'Mayúsculas',    sample: 'A–Z',   charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', enabled: true  },
  { key: 'lower',   label: 'Minúsculas',    sample: 'a–z',   charset: 'abcdefghijklmnopqrstuvwxyz', enabled: true  },
  { key: 'numbers', label: 'Números',       sample: '0–9',   charset: '0123456789',                  enabled: true  },
  { key: 'symbols', label: 'Símbolos',      sample: '!@#…',  charset: '!@#$%^&*()_+-=[]{}|;:,.<>?', enabled: false },
])

const length           = ref(16)
const excludeAmbiguous = ref(false)
const password         = ref('')
const showPassword     = ref(false)
const copiedPassword   = ref(false)
const noCharsetError   = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

function buildCharset(): string {
  let chars = charOptions
    .filter(o => o.enabled)
    .map(o => o.charset)
    .join('')

  if (excludeAmbiguous.value) {
    chars = [...chars].filter(c => !AMBIGUOUS.has(c)).join('')
  }

  return chars
}

function generate() {
  noCharsetError.value = false
  const charset = buildCharset()

  if (!charset) {
    noCharsetError.value = true
    return
  }

  const bytes = new Uint8Array(length.value)
  crypto.getRandomValues(bytes)
  password.value = Array.from(bytes)
    .map(b => charset[b % charset.length])
    .join('')
}

const strength = computed(() => {
  const pw = password.value
  if (!pw) return { pct: 0, label: '', barColor: '', textColor: '' }

  const charsetSize = buildCharset().length
  const entropy = Math.log2(charsetSize) * pw.length

  if (entropy < 40)  return { pct: 20,  label: 'Muy débil',  barColor: 'bg-red-500',    textColor: 'text-red-500'    }
  if (entropy < 60)  return { pct: 40,  label: 'Débil',      barColor: 'bg-orange-500', textColor: 'text-orange-500' }
  if (entropy < 80)  return { pct: 60,  label: 'Buena',      barColor: 'bg-yellow-500', textColor: 'text-yellow-500' }
  if (entropy < 100) return { pct: 80,  label: 'Fuerte',     barColor: 'bg-lime-500',   textColor: 'text-lime-500'   }
  return               { pct: 100, label: 'Muy fuerte', barColor: 'bg-emerald-500', textColor: 'text-emerald-500' }
})

async function copyPassword() {
  if (!password.value) return
  await navigator.clipboard.writeText(password.value)
  copiedPassword.value = true
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copiedPassword.value = false }, 2000)
}

onMounted(generate)
onBeforeUnmount(() => { if (copyTimer) clearTimeout(copyTimer) })
</script>
