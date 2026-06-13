// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  sourcemap: false,
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/image', 'nuxt-gtag', '@sidebase/nuxt-auth', '@nuxtjs/color-mode', 'nuxt-monaco-editor'],
  gtag: {
    id: 'G-HB48CY1HBF'
  },
  css: [
    '/assets/css/app.css',
    '@dronico/droni-kit/dist/droni-kit.css'
  ],
  runtimeConfig: {
    appi: process.env.APPI,
    appiSiteId: process.env.APPI_SITE_ID,
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css' }
      ]
    }
  },
  image: {
    quality: 70,
    format: ['webp'],
    screens: {
      'xs': 320,
      'sm': 640,
      'md': 768,
      'lg': 1024,
      'xl': 1280,
      'xxl': 1536,
      '2xl': 1536
    }
  },
  auth: {
    baseURL: process.env.AUTH_BASE_URL,
    provider: {
      type: 'authjs'
    }
  },
  vite: {
    plugins: [
      tailwindcss()
    ],
  },
  colorMode: {
    classSuffix: ''
  },
  monacoEditor: {
    // These are default values:
    locale: 'en',
    componentName: {
      codeEditor: 'MonacoEditor',
      diffEditor: 'MonacoDiffEditor'
    }
  }
})