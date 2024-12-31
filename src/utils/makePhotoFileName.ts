import { Dayjs } from 'dayjs'

/**
 * Tạo tên file ảnh trên GitHub. File ảnh luôn có phần mở rộng là `.webp`.
 *
 * Tên file ví dụ: `20241005-c5kJxW.webp`
 */
export function makePhotoFileName(noteTime: Dayjs, photoKey: string): string {
	const formattedDate: string = noteTime.format('YYYYMMDD')

	return `${formattedDate}-${photoKey}.webp`
}
