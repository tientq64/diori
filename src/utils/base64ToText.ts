/**
 * Giải mã chuỗi base64 sang văn bản.
 * @param text Chuỗi base64 cần giải mã.
 * @returns Văn bản đã được giải mã.
 */
export function base64ToText(base64: string): string {
	return decodeURIComponent(escape(atob(base64)))
}
