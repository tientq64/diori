/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{tsx,ts}',
		'./index.html'
	],
	theme: {
		extend: {}
	},
	darkMode: ['selector', 'html[data-prefers-color-scheme="dark"]'],
	plugins: []
}
