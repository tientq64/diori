import { compressBase64 } from './compressBase64'
import { textToBase64 } from './textToBase64'

/**
 * Mã hóa văn bản sang chuỗi base64 được nén.
 * @param text Văn bản cần mã hóa.
 * @returns Chuỗi base64 được nén.
 */
export function textToMinBase64(text: string): string {
	return compressBase64(textToBase64(text))
}
