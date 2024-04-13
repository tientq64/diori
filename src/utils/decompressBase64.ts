import { radix62ToInt } from './radix62ToInt'

export function decompressBase64(compressedBase64: string): string {
	const base64 = compressedBase64
		.replace(/~$/, '==')
		.replace(')', 'XRUJQ')
		.replace('(', 'UklGR')
		.replace(/\./g, 'AA')

		.replace(/\^[\da-zA-Z]{3}|=[\da-zA-Z]{2}|~[\da-zA-Z]/g, (s) => {
			const int62 = s.substring(1)
			const len = radix62ToInt(int62) + 3
			return 'A'.repeat(len)
		})

		.replace(/-/g, '+')
		.replace(/_/g, '/')

	return base64
}
