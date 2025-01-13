import { AES, enc } from 'crypto-js'

/**
 * Giải mã văn bản đã được mã hóa.
 *
 * @param text Văn bản cần giải mã.
 * @param key Khóa bí mật dùng để giải mã.
 * @returns Văn bản đã được giải mã. Nếu văn bản giải mã không hợp lệ, sẽ trả về `''`.
 */
export function decryptText(text: string, key: string): string {
	if (text === '') return ''
	try {
		return AES.decrypt(text, key).toString(enc.Utf8)
	} catch {
		return ''
	}
}
