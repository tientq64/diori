import { intToRadix62 } from './intToRadix62'

export function base64ToMinBase64(base64: string): string {
	const minBase64 = base64
		.replace(/\//g, '_')

		.replace(/AAA+/g, (s) => {
			const int62 = intToRadix62(s.length - 3)
			const len = int62.length
			switch (len) {
				case 1:
					return '-' + int62
				case 2:
					return '=' + int62
				case 3:
					return '~' + int62
				default:
					return s
			}
		})

		.replace(/AA/g, "'")

		.replace(/-1/g, '^')

	return minBase64
}
