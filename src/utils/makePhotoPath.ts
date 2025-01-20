import { Dayjs } from 'dayjs'
import { makePhotoFileName } from './makePhotoFileName'

/**
 * Tạo và trả về đường dẫn file ảnh trên GitHub.
 *
 * Đường dẫn ví dụ: `10/05/20241005-c5kJxW.webp`
 */
export function makePhotoPath(noteTime: Dayjs, photoKey: string): string {
	const dirName: string = noteTime.format('MM/DD')
	const fileName: string = makePhotoFileName(noteTime, photoKey)

	return `${dirName}/${fileName}`
}
