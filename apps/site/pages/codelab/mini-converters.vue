<template>
  <div class="bg-zinc-50 dark:bg-zinc-900 min-h-screen">
    <div class="max-w-5xl mx-auto py-10 px-4">

      <!-- Page header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Utilidades y generadores</h1>
        <p class="text-zinc-500 dark:text-zinc-400 mt-1">Herramientas rápidas y focalizadas. Todo se ejecuta en tu navegador.</p>
      </div>

      <!-- Mobile nav — horizontal pills -->
      <nav class="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        <a
          v-for="s in SECTIONS"
          :key="s.id"
          :href="`#${s.id}`"
          class="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border"
          :class="activeId === s.id
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-slate-300 dark:border-slate-600 hover:border-indigo-400'"
          @click.prevent="scrollTo(s.id)"
        >
          <i :class="`mdi ${s.icon} text-sm`" />
          {{ s.label }}
        </a>
      </nav>

      <div class="flex gap-8 items-start">

        <!-- Sidebar — desktop -->
        <aside class="hidden lg:block w-48 flex-shrink-0">
          <nav class="sticky top-6 flex flex-col gap-1">
            <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 px-3">Herramientas</p>
            <a
              v-for="s in SECTIONS"
              :key="s.id"
              :href="`#${s.id}`"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              :class="activeId === s.id
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'"
              @click.prevent="scrollTo(s.id)"
            >
              <i :class="`mdi ${s.icon} text-base`" />
              {{ s.label }}
            </a>
          </nav>
        </aside>

        <!-- Sections -->
        <div class="flex-1 min-w-0 flex flex-col gap-8">
          <div id="url-encoder"><CodelabMiniUrlEncoder /></div>
          <div id="query-analyzer"><CodelabMiniQueryAnalyzer /></div>
          <div id="case-converter"><CodelabMiniCaseConverter /></div>
          <div id="epoch"><CodelabMiniEpochConverter /></div>
          <div id="css-units"><CodelabMiniCssUnits /></div>
          <div id="password"><CodelabMiniPasswordGenerator /></div>
          <div id="uuid"><CodelabMiniUuidGenerator /></div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Utilidades y generadores | Droni.co',
  ogTitle: 'Utilidades y generadores | Droni.co',
  description: 'URL encoder, query string analyzer, case converter, epoch timestamp, unidades CSS, generador de contraseñas y UUIDs.',
  ogDescription: 'URL encoder, query string analyzer, case converter, epoch timestamp, unidades CSS, generador de contraseñas y UUIDs.',
  ogImage: 'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
  twitterCard: 'summary_large_image',
  ogUrl: 'https://droni.co/codelab/mini-converters',
})

const SECTIONS = [
  { id: 'url-encoder',    label: 'URL Encoder',    icon: 'mdi-link-variant'       },
  { id: 'query-analyzer', label: 'Query String',   icon: 'mdi-magnify'            },
  { id: 'case-converter', label: 'Case Converter', icon: 'mdi-format-letter-case' },
  { id: 'epoch',          label: 'Epoch / Unix',   icon: 'mdi-clock-outline'      },
  { id: 'css-units',      label: 'Unidades CSS',   icon: 'mdi-ruler'              },
  { id: 'password',       label: 'Contraseñas',    icon: 'mdi-lock'               },
  { id: 'uuid',           label: 'UUID',           icon: 'mdi-identifier'         },
]

const activeId = ref(SECTIONS[0].id)

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      // Pick the first entry that is intersecting (topmost visible section)
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visible.length) activeId.value = visible[0].target.id
    },
    { rootMargin: '-10% 0% -60% 0%', threshold: 0 },
  )

  for (const s of SECTIONS) {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  }

  onBeforeUnmount(() => observer.disconnect())
})
</script>
