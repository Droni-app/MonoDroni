/// <reference types="vite-plugin-pages/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string
	readonly VITE_APP_URL: string
	readonly VITE_APPI_OAUTH_CLIENT_ID?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
