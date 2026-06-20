<template>
  <div class="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900">

    <!-- Toolbar -->
    <div class="flex items-center gap-3 px-4 py-2 border-b border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-800 flex-shrink-0">
      <!-- Mode -->
      <div class="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden text-sm">
        <button
          class="px-3 py-1.5 font-medium transition-colors"
          :class="mode === 'text' ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'"
          @click="setMode('text')"
        >
          <i class="mdi mdi-text" /> Texto
        </button>
        <button
          class="px-3 py-1.5 font-medium transition-colors"
          :class="mode === 'file' ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'"
          @click="setMode('file')"
        >
          <i class="mdi mdi-file" /> Archivo
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600" />

      <!-- Direction -->
      <div class="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden text-sm">
        <button
          class="px-3 py-1.5 font-medium transition-colors"
          :class="direction === 'encode' ? 'bg-emerald-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'"
          @click="setDirection('encode')"
        >
          <i class="mdi mdi-arrow-right-circle" /> Codificar
        </button>
        <button
          class="px-3 py-1.5 font-medium transition-colors"
          :class="direction === 'decode' ? 'bg-emerald-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'"
          @click="setDirection('decode')"
        >
          <i class="mdi mdi-arrow-left-circle" /> Decodificar
        </button>
      </div>

      <div class="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
        <i class="mdi mdi-shield-check text-emerald-500" /> Todo se procesa en tu navegador
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-1 overflow-hidden">

      <!-- Left: Input -->
      <section class="w-1/2 flex flex-col h-full border-r border-slate-300 dark:border-slate-700">
        <header class="flex items-center justify-between px-4 py-3 border-b border-slate-300 dark:border-slate-700 flex-shrink-0">
          <h2 class="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
            {{ inputLabel }}
          </h2>
          <div class="flex gap-2">
            <DuiButton v-if="hasInput" size="sm" variant="outline" @click="clearAll">
              <i class="mdi mdi-close" /> Limpiar
            </DuiButton>
          </div>
        </header>

        <!-- Text input -->
        <div v-if="mode === 'text'" class="flex-1 p-4 overflow-hidden">
          <textarea
            v-model="textInput"
            :placeholder="direction === 'encode' ? 'Escribe o pega el texto a codificar...' : 'Pega el Base64 a decodificar...'"
            class="w-full h-full resize-none rounded-lg p-3 font-mono text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>

        <!-- File encode: dropzone -->
        <div v-else-if="mode === 'file' && direction === 'encode'" class="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
          <div
            class="flex-1 min-h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
            :class="isDragging
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'"
            @click="triggerFileInput"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onFileDrop"
          >
            <i class="mdi mdi-upload text-4xl" :class="isDragging ? 'text-indigo-500' : 'text-zinc-400'" />
            <div class="text-center">
              <p class="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {{ isDragging ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar' }}
              </p>
              <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Cualquier tipo de archivo · procesado en el cliente</p>
            </div>
          </div>
          <input ref="fileInputRef" type="file" class="hidden" @change="onFileSelected" />

          <!-- File info -->
          <div v-if="uploadedFile" class="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-zinc-800 flex items-center gap-3">
            <i class="mdi mdi-file text-2xl text-indigo-500" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{{ uploadedFile.name }}</p>
              <p class="text-xs text-zinc-400">{{ formatSize(uploadedFile.size) }} · {{ uploadedFile.type || 'tipo desconocido' }}</p>
            </div>
            <button class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" @click.stop="clearFile">
              <i class="mdi mdi-close" />
            </button>
          </div>
        </div>

        <!-- File decode: base64 input -->
        <div v-else class="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
          <textarea
            v-model="fileBase64Input"
            placeholder="Pega el Base64 del archivo aquí (con o sin prefijo data:...)..."
            class="flex-1 resize-none rounded-lg p-3 font-mono text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
      </section>

      <!-- Right: Output -->
      <section class="w-1/2 flex flex-col h-full bg-white dark:bg-zinc-800">
        <header class="flex items-center justify-between px-4 py-3 border-b border-slate-300 dark:border-slate-700 flex-shrink-0">
          <h2 class="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
            {{ outputLabel }}
          </h2>
          <div class="flex gap-2">
            <DuiButton v-if="textOutput && mode === 'text'" size="sm" variant="outline" @click="copyOutput">
              <i :class="copied ? 'mdi mdi-check text-emerald-500' : 'mdi mdi-content-copy'" />
              {{ copied ? 'Copiado' : 'Copiar' }}
            </DuiButton>
            <DuiButton v-if="mode === 'file' && direction === 'encode' && fileBase64Output" size="sm" variant="outline" @click="copyFileBase64">
              <i :class="copied ? 'mdi mdi-check text-emerald-500' : 'mdi mdi-content-copy'" />
              {{ copied ? 'Copiado' : 'Copiar' }}
            </DuiButton>
          </div>
        </header>

        <!-- Error -->
        <div v-if="outputError" class="m-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
          <p class="text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <i class="mdi mdi-alert-circle" /> {{ outputError }}
          </p>
        </div>

        <!-- Empty state -->
        <div v-else-if="!hasOutput" class="flex flex-col items-center justify-center flex-1 text-zinc-400 dark:text-zinc-500 gap-3">
          <i class="mdi mdi-code-brackets text-5xl" />
          <p class="text-sm">
            {{ mode === 'text'
              ? (direction === 'encode' ? 'Escribe algo en el panel izquierdo' : 'Pega un Base64 en el panel izquierdo')
              : (direction === 'encode' ? 'Sube un archivo para ver su Base64' : 'Pega un Base64 para descargar el archivo')
            }}
          </p>
        </div>

        <!-- Text output -->
        <div v-else-if="mode === 'text'" class="flex-1 p-4 overflow-hidden flex flex-col gap-2">
          <div class="text-xs text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
            <span>{{ textOutput.length.toLocaleString() }} caracteres</span>
            <span v-if="direction === 'encode'">
              {{ ((textOutput.length / (textInput.length || 1)) * 100 - 100).toFixed(0) }}% más grande
            </span>
          </div>
          <textarea
            :value="textOutput"
            readonly
            class="flex-1 resize-none rounded-lg p-3 font-mono text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
        </div>

        <!-- File encode output: base64 -->
        <div v-else-if="mode === 'file' && direction === 'encode' && fileBase64Output" class="flex-1 p-4 overflow-hidden flex flex-col gap-3">
          <div class="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 flex-shrink-0">
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Archivo original:</span>
                <span class="text-zinc-700 dark:text-zinc-300 ml-1">{{ formatSize(uploadedFile!.size) }}</span>
              </div>
              <div>
                <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Base64 generado:</span>
                <span class="text-zinc-700 dark:text-zinc-300 ml-1">{{ formatSize(fileBase64Output.length) }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Tipo MIME:</span>
                <span class="text-zinc-700 dark:text-zinc-300 ml-1 font-mono">{{ uploadedFile!.type || 'application/octet-stream' }}</span>
              </div>
            </div>
          </div>
          <textarea
            :value="fileBase64Output"
            readonly
            class="flex-1 resize-none rounded-lg p-3 font-mono text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
        </div>

        <!-- File decode output: download -->
        <div v-else-if="mode === 'file' && direction === 'decode' && decodedFile" class="flex-1 p-6 flex flex-col items-center justify-center gap-6">
          <div class="flex flex-col items-center gap-3">
            <div class="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <i :class="`mdi ${mimeIcon} text-4xl text-indigo-600 dark:text-indigo-400`" />
            </div>
            <div class="text-center">
              <p class="font-semibold text-zinc-900 dark:text-zinc-100">{{ decodedFile.name }}</p>
              <p class="text-sm text-zinc-500 dark:text-zinc-400">{{ decodedFile.mime }} · {{ formatSize(decodedFile.size) }}</p>
            </div>
          </div>

          <!-- Image preview -->
          <img
            v-if="decodedFile.isImage && decodedFile.objectUrl"
            :src="decodedFile.objectUrl"
            class="max-w-full max-h-48 rounded-lg border border-slate-200 dark:border-slate-700 object-contain"
            alt="Preview"
          />

          <DuiButton color="primary" @click="downloadDecodedFile">
            <i class="mdi mdi-download" /> Descargar archivo
          </DuiButton>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DuiButton } from '@dronico/droni-kit'

useSeoMeta({
  title: 'Base64 Codificar / Decodificar | Droni.co',
  ogTitle: 'Base64 Codificar / Decodificar | Droni.co',
  description: 'Codifica y decodifica texto y archivos en Base64 directamente en tu navegador. Sin servidor, sin límites.',
  ogDescription: 'Codifica y decodifica texto y archivos en Base64 directamente en tu navegador. Sin servidor, sin límites.',
  ogImage: 'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
  twitterCard: 'summary_large_image',
  ogUrl: 'https://droni.co/codelab/base64'
})

// ─── State ───────────────────────────────────────────────────────────────────

type Mode = 'text' | 'file'
type Direction = 'encode' | 'decode'

const mode = ref<Mode>('text')
const direction = ref<Direction>('encode')

// Text
const textInput = ref('')
const copied = ref(false)

// File encode
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)
const fileBase64Output = ref('')
const isDragging = ref(false)

// File decode
const fileBase64Input = ref('')

interface DecodedFile {
  name: string
  mime: string
  size: number
  objectUrl: string
  isImage: boolean
}
const decodedFile = ref<DecodedFile | null>(null)
const outputError = ref('')

// ─── Labels ──────────────────────────────────────────────────────────────────

const inputLabel = computed(() => {
  if (mode.value === 'text') return direction.value === 'encode' ? 'Texto a codificar' : 'Base64 a decodificar'
  return direction.value === 'encode' ? 'Archivo a codificar' : 'Base64 a decodificar'
})

const outputLabel = computed(() => {
  if (mode.value === 'text') return direction.value === 'encode' ? 'Base64 resultante' : 'Texto decodificado'
  return direction.value === 'encode' ? 'Base64 del archivo' : 'Archivo decodificado'
})

// ─── Computed ────────────────────────────────────────────────────────────────

const textOutput = computed(() => {
  if (mode.value !== 'text' || !textInput.value) return ''
  try {
    if (direction.value === 'encode') {
      return btoa(unescape(encodeURIComponent(textInput.value)))
    } else {
      return decodeURIComponent(escape(atob(textInput.value.trim())))
    }
  } catch {
    return ''
  }
})

const hasInput = computed(() => {
  if (mode.value === 'text') return !!textInput.value
  if (direction.value === 'encode') return !!uploadedFile.value
  return !!fileBase64Input.value
})

const hasOutput = computed(() => {
  if (outputError.value) return false
  if (mode.value === 'text') return !!textOutput.value
  if (direction.value === 'encode') return !!fileBase64Output.value
  return !!decodedFile.value
})

// ─── Text error (shown inline in output area via outputError) ────────────────

watch([textInput, direction, mode], () => {
  outputError.value = ''
  if (mode.value !== 'text' || !textInput.value.trim()) return
  try {
    if (direction.value === 'encode') {
      btoa(unescape(encodeURIComponent(textInput.value)))
    } else {
      decodeURIComponent(escape(atob(textInput.value.trim())))
    }
  } catch {
    outputError.value = direction.value === 'decode'
      ? 'El texto no es un Base64 válido.'
      : 'Error al codificar el texto.'
  }
})

// ─── File encode ─────────────────────────────────────────────────────────────

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

function onFileDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  uploadedFile.value = file
  fileBase64Output.value = ''
  outputError.value = ''

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    // dataUrl = "data:mime;base64,xxxx" — keep full data URL
    fileBase64Output.value = dataUrl
  }
  reader.onerror = () => {
    outputError.value = 'Error al leer el archivo.'
  }
  reader.readAsDataURL(file)
}

function clearFile() {
  uploadedFile.value = null
  fileBase64Output.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// ─── File decode ─────────────────────────────────────────────────────────────

const MAGIC_BYTES: Array<{ prefix: string; mime: string; ext: string }> = [
  { prefix: 'JVBERi0',  mime: 'application/pdf',  ext: 'pdf'  },
  { prefix: 'iVBORw0', mime: 'image/png',          ext: 'png'  },
  { prefix: '/9j/',     mime: 'image/jpeg',         ext: 'jpg'  },
  { prefix: 'R0lGOD',  mime: 'image/gif',           ext: 'gif'  },
  { prefix: 'UEsDB',   mime: 'application/zip',     ext: 'zip'  },
  { prefix: 'Qk0',     mime: 'image/bmp',           ext: 'bmp'  },
  { prefix: 'SUkqAA',  mime: 'image/tiff',          ext: 'tif'  },
  { prefix: 'AAABAA',  mime: 'image/x-icon',        ext: 'ico'  },
  { prefix: 'UklGR',   mime: 'image/webp',          ext: 'webp' },
  { prefix: 'AAAA',    mime: 'video/mp4',           ext: 'mp4'  },
  { prefix: 'T2dn',    mime: 'audio/ogg',           ext: 'ogg'  },
  { prefix: 'SUQz',    mime: 'audio/mpeg',          ext: 'mp3'  },
  { prefix: 'GkXf',    mime: 'video/webm',          ext: 'webm' },
]

function detectMimeFromBase64(b64: string): { mime: string; ext: string } {
  for (const { prefix, mime, ext } of MAGIC_BYTES) {
    if (b64.startsWith(prefix)) return { mime, ext }
  }
  return { mime: 'application/octet-stream', ext: 'bin' }
}

function parseBase64Input(raw: string): { mime: string; b64: string; ext: string } {
  const trimmed = raw.trim()
  const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,(.+)$/)
  if (dataUrlMatch) {
    const mime = dataUrlMatch[1]
    const ext = mime.split('/')[1]?.split('+')[0] ?? 'bin'
    return { mime, b64: dataUrlMatch[2], ext }
  }
  // raw base64 without prefix
  const { mime, ext } = detectMimeFromBase64(trimmed)
  return { mime, b64: trimmed, ext }
}

watch(fileBase64Input, (val) => {
  outputError.value = ''
  decodedFile.value = null

  const trimmed = val.trim()
  if (!trimmed) return

  try {
    const { mime, b64, ext } = parseBase64Input(trimmed)

    // Validate base64 chars
    if (!/^[A-Za-z0-9+/=\n\r]+$/.test(b64)) {
      outputError.value = 'El contenido no parece un Base64 válido.'
      return
    }

    const cleanB64 = b64.replace(/[\n\r]/g, '')
    const binary = atob(cleanB64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes], { type: mime })
    const objectUrl = URL.createObjectURL(blob)

    decodedFile.value = {
      name: `archivo-decodificado.${ext}`,
      mime,
      size: blob.size,
      objectUrl,
      isImage: mime.startsWith('image/'),
    }
  } catch {
    outputError.value = 'No se pudo decodificar el Base64. Verifica que sea un string válido.'
  }
})

function downloadDecodedFile() {
  if (!decodedFile.value) return
  const a = document.createElement('a')
  a.href = decodedFile.value.objectUrl
  a.download = decodedFile.value.name
  a.click()
}

// ─── MIME icon ────────────────────────────────────────────────────────────────

const mimeIcon = computed(() => {
  const mime = decodedFile.value?.mime ?? ''
  if (mime.startsWith('image/')) return 'mdi-image'
  if (mime.startsWith('video/')) return 'mdi-video'
  if (mime.startsWith('audio/')) return 'mdi-music'
  if (mime === 'application/pdf') return 'mdi-file-pdf-box'
  if (mime === 'application/zip') return 'mdi-folder-zip'
  return 'mdi-file'
})

// ─── Actions ─────────────────────────────────────────────────────────────────

async function copyOutput() {
  await navigator.clipboard.writeText(textOutput.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

async function copyFileBase64() {
  await navigator.clipboard.writeText(fileBase64Output.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function setMode(m: Mode) {
  mode.value = m
  clearAll()
}

function setDirection(d: Direction) {
  direction.value = d
  clearAll()
}

function clearAll() {
  textInput.value = ''
  uploadedFile.value = null
  fileBase64Output.value = ''
  fileBase64Input.value = ''
  outputError.value = ''
  if (decodedFile.value?.objectUrl) URL.revokeObjectURL(decodedFile.value.objectUrl)
  decodedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

onBeforeUnmount(() => {
  if (decodedFile.value?.objectUrl) URL.revokeObjectURL(decodedFile.value.objectUrl)
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
</script>
