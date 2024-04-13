import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
	server: {
		port: 5500,
		host: '0.0.0.0'
	},
	build: {
		minify: 'terser'
	},
	plugins: [react()]
})
