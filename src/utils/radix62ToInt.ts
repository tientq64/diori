import { radix62Charset } from './intToRadix62'

/**
 * Convert số từ base-62 sang base-10.
 */
export function radix62ToInt(radix62: string): number {
	let int: number = 0
	for (const letter of radix62) {
		int = int * radix62Charset.length + radix62Charset.indexOf(letter)
	}
	return int
}
