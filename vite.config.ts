import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
	server: {
		port: 5500,
		host: '0.0.0.0'
	},
	plugins: [
		react(),
		mkcert(),
		visualizer({
			filename: 'temp/stats.html'
		})
	]
})
