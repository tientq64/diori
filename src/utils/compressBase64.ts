import { intToRadix62 } from './intToRadix62'

/**
 * Nén chuỗi base64.
 * @param base64 Chuỗi base64 cần nén.
 * @returns Chuỗi base64 đã được nén.
 */
export function compressBase64(base64: string): string {
	const minBase64 = base64
		.replace(/\//g, '_')
		.replace(/\+/g, '-')

		.replace(/AAA+/g, (s) => {
			const int62 = intToRadix62(s.length - 3)
			const len = int62.length
			return '~=^'[len - 1] + int62
		})

		.replace(/AA/g, '.')
		.replace('UklGR', '(')
		.replace('XRUJQ', ')')
		.replace(/==$/, '~')

	return minBase64
}
