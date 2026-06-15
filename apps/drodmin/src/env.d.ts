/// <reference types="vite-plugin-pages/client" />

interface ImportMetaEnv {
	readonly VITE_APP_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
