import { radix62ToInt } from './radix62ToInt'

export function minBase64ToBase64(minBase64: string): string {
	const base64 = minBase64
		.replace(/\^/g, '-1')

		.replace(/'/g, 'AA')

		.replace(/~([\da-zA-Z]{3})|=([\da-zA-Z]{2})|-([\da-zA-Z])/g, (...s) => {
			const int62 = s[1] || s[2] || s[3]
			const len = radix62ToInt(int62) + 3
			return 'A'.repeat(len)
		})

		.replace(/_/g, '/')

	return base64
}
