/**
 * Mã hóa văn bản sang chuỗi base64.
 * @param text Văn bản cần mã hóa.
 * @returns Chuỗi base64.
 */
export function textToBase64(text: string): string {
	return btoa(unescape(encodeURIComponent(text)))
}
