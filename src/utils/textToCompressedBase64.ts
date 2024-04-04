import { compressBase64 } from './compressBase64'
import { textToBase64 } from './textToBase64'

export function textToCompressedBase64(text: string): string {
	return compressBase64(textToBase64(text))
}
