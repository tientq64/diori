import { AES } from 'crypto-js'

/**
 * Mã hóa văn bản.
 *
 * @param text Văn bản cần mã hóa.
 * @param key Khóa bí mật dùng để mã hóa và giải mã văn bản.
 * @returns Văn bản đã được mã hóa.
 */
export function encryptText(text: string, key: string): string {
	return AES.encrypt(text, key).toString()
}
