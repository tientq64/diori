import { Dayjs } from 'dayjs'

/**
 * Tạo tên file ảnh trên GitHub.
 */
export function makePhotoFileName(noteTime: Dayjs, photoKey: string): string {
	const formattedDate: string = noteTime.format('YYYYMMDD')

	return `${formattedDate}-${photoKey}.webp`
}
