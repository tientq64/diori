import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
	server: {
		port: 5500,
		host: '0.0.0.0'
	},
	plugins: [react(), mkcert()]
})
