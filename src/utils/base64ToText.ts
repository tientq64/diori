export function base64ToText(base64: string): string {
	return decodeURIComponent(escape(atob(base64)))
}
