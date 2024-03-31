import { base64ToText } from './base64ToText'
import { minBase64ToBase64 } from './minBase64ToBase64'

export function minBase64ToText(minBase64: string): string {
	return base64ToText(minBase64ToBase64(minBase64))
}
