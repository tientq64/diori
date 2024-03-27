import { AES } from 'crypto-js'

export function encryptText(text: string, key: string): string {
	return AES.encrypt(text, key).toString()
}
