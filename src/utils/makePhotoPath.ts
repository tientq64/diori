import { Dayjs } from 'dayjs'
import { makePhotoFileName } from './makePhotoFileName'

/**
 * Tạo đường dẫn file ảnh trên GitHub.
 */
export function makePhotoPath(noteTime: Dayjs, photoKey: string): string {
	const dirName: string = noteTime.format('MM/DD')
	const fileName: string = makePhotoFileName(noteTime, photoKey)

	return `${dirName}/${fileName}`
}
