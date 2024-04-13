import { intToRadix62 } from './intToRadix62'

export function compressBase64(base64: string): string {
	const compressedBase64 = base64
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

	return compressedBase64
}
