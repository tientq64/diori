import { base64ToText } from './base64ToText'
import { decompressBase64 } from './decompressBase64'

/**
 * Giải mã chuỗi base64 được nén sang văn bản.
 * @param minBase64 Chuỗi base64 được nén.
 * @returns Văn bản đã được giải mã.
 */
export function minBase64ToText(minBase64: string): string {
	return base64ToText(decompressBase64(minBase64))
}
