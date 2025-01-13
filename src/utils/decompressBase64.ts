import { radix62ToInt } from './radix62ToInt'

/**
 * Giải nén chuỗi base64 được nén.
 *
 * @param minBase64 Chuỗi base64 được nén.
 * @returns Chuỗi base64.
 */
export function decompressBase64(minBase64: string): string {
	const base64 = minBase64
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
