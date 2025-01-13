/**
 * @type {import('tailwindcss').Config}
 */

export default {
	content: ['./src/**/*.{tsx,ts}', './index.html'],
	theme: {
		screens: {
			xs: { min: '0px', max: '767px' },
			md: { min: '768px' }
		}
	},
	darkMode: ['selector', '.dark'],
	plugins: [
		({ addVariant }) => {
			addVariant('light', '.light &')
		}
	]
}
