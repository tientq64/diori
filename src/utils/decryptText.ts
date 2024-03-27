import { AES, enc } from 'crypto-js'

export function decryptText(text: string, key: string): string {
	if (text === '') return ''
	try {
		return AES.decrypt(text, key).toString(enc.Utf8)
	} catch {
		return ''
	}
}
