import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
	server: {
		port: 5500
	},
	plugins: [react()]
})
