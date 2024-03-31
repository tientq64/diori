import { base64ToMinBase64 } from './base64ToMinBase64'
import { textToBase64 } from './textToBase64'

export function textToMinBase64(text: string): string {
	return base64ToMinBase64(textToBase64(text))
}
