import { base64ToText } from './base64ToText'
import { decompressBase64 } from './decompressBase64'

export function compressedBase64ToText(minBase64: string): string {
	return base64ToText(decompressBase64(minBase64))
}
