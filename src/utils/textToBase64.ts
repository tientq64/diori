export function textToBase64(text: string): string {
	return btoa(unescape(encodeURIComponent(text)))
}
