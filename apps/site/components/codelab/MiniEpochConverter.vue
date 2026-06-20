<template>
  <section class="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <CodelabMiniSectionHeader icon="mdi-clock-outline" color="amber" title="Epoch / Unix Timestamp">
      Convierte timestamps Unix a fechas legibles y viceversa.
    </CodelabMiniSectionHeader>

    <div class="flex flex-col gap-6">

      <!-- Timestamp → Date -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">Timestamp → Fecha</p>
        <div class="flex gap-2">
          <input
            v-model="epochInput"
            type="number"
            placeholder="ej. 1718832000"
            class="rounded-lg px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex-1"
          >
          <DuiButton size="sm" variant="outline" @click="epochInput = String(Math.floor(Date.now() / 1000))">
            <i class="mdi mdi-clock-fast" /> Ahora
          </DuiButton>
        </div>
        <div v-if="epochResult" class="mt-3 flex flex-col gap-1">
          <EpochRow v-for="row in epochRows" :key="row.id" v-bind="row" :copied-id="copiedId" @copy="flash(row.id)" />
        </div>
        <p v-else-if="epochInput && !epochResult" class="mt-2 text-sm text-red-500">Timestamp inválido.</p>
      </div>

      <div class="border-t border-slate-200 dark:border-slate-700" />

      <!-- Date → Timestamp -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">Fecha → Timestamp</p>
        <input
          v-model="dateInput"
          type="datetime-local"
          class="rounded-lg px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
        <div v-if="dateResult" class="mt-3 flex flex-col gap-1">
          <EpochRow
            id="date-s"
            label="Segundos"
            :value="String(dateResult.seconds)"
            :copied-id="copiedId"
            @copy="flash('date-s')"
          />
          <EpochRow
            id="date-ms"
            label="Milisegundos"
            :value="String(dateResult.ms)"
            :copied-id="copiedId"
            @copy="flash('date-ms')"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DuiButton } from '@dronico/droni-kit'

// ─── Internal EpochRow ───────────────────────────────────────────────────────

const EpochRow = defineComponent({
  props: {
    id:       { type: String, required: true },
    label:    { type: String, required: true },
    value:    { type: String, required: true },
    copiedId: { type: String as () => string | null, default: null },
  },
  emits: ['copy'],
  setup(props, { emit }) {
    const active = computed(() => props.copiedId === props.id)
    return () => h('div', { class: 'flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50' }, [
      h('span', { class: 'w-28 flex-shrink-0 text-xs font-semibold text-zinc-500 dark:text-zinc-400' }, props.label),
      h('span', { class: 'flex-1 font-mono text-sm text-zinc-900 dark:text-zinc-100 break-all' }, props.value),
      h(resolveComponent('CodelabMiniCopyButton'), {
        text:   props.value,
        active: active.value,
        onCopy: () => emit('copy'),
      }),
    ])
  },
})

// ─── State ───────────────────────────────────────────────────────────────────

const epochInput = ref('')
const dateInput  = ref('')
const copiedId   = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

// ─── Logic ───────────────────────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const abs  = Math.abs(diff)
  const past = diff > 0
  if (abs < 60_000)        return `${past ? 'hace' : 'en'} ${Math.floor(abs / 1_000)} segundos`
  if (abs < 3_600_000)     return `${past ? 'hace' : 'en'} ${Math.floor(abs / 60_000)} minutos`
  if (abs < 86_400_000)    return `${past ? 'hace' : 'en'} ${Math.floor(abs / 3_600_000)} horas`
  if (abs < 2_592_000_000) return `${past ? 'hace' : 'en'} ${Math.floor(abs / 86_400_000)} días`
  return `${past ? 'hace' : 'en'} ${Math.floor(abs / 2_592_000_000)} meses`
}

const epochResult = computed(() => {
  const raw = epochInput.value.trim()
  if (!raw) return null
  const n = Number(raw)
  if (isNaN(n)) return null
  const ms   = raw.length >= 13 ? n : n * 1000
  const date = new Date(ms)
  if (isNaN(date.getTime())) return null
  return {
    utc:      date.toUTCString(),
    local:    date.toLocaleString(),
    iso:      date.toISOString(),
    relative: relativeTime(date),
  }
})

const epochRows = computed(() => epochResult.value
  ? [
      { id: 'epoch-utc',   label: 'UTC',      value: epochResult.value.utc      },
      { id: 'epoch-local', label: 'Local',     value: epochResult.value.local    },
      { id: 'epoch-iso',   label: 'ISO 8601',  value: epochResult.value.iso      },
      { id: 'epoch-rel',   label: 'Relativo',  value: epochResult.value.relative },
    ]
  : []
)

const dateResult = computed(() => {
  if (!dateInput.value) return null
  const date = new Date(dateInput.value)
  if (isNaN(date.getTime())) return null
  return { seconds: Math.floor(date.getTime() / 1000), ms: date.getTime() }
})

function flash(id: string) {
  copiedId.value = id
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { copiedId.value = null }, 2000)
}

onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>
