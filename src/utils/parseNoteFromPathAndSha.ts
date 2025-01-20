import dayjs, { Dayjs } from 'dayjs'
import VietnameseDate from 'vietnamese-date'
import { Note, NoteData } from '../store/slices/diarySlice'
import { decompressBase64 } from './decompressBase64'
import { minBase64ToText } from './minBase64ToText'

/**
 * Phân giải thành mục nhật ký từ path file GitHub và SHA.
 *
 * @param path Đường dẫn file GitHub của mục nhật ký này.
 * @param sha SHA của file GitHub.
 * @returns Mục nhật ký.
 */
export function parseNoteFromPathAndSha(path: string, sha: string): Note {
	const [yearStr, fileName] = path.split('/').slice(-2)
	const year: number = Number(yearStr)
	const chunks: string[] = fileName.replace(/\.json$/, '').split(';')

	const time: Dayjs = dayjs(year + chunks[0])
	const date: string = time.format('YYYY-MM-DD')
	const lunar: VietnameseDate = new VietnameseDate(time.toDate())

	const title: string = minBase64ToText(chunks[1])
	const isTitled: boolean = chunks[2] === 'T'

	const thumbnailUrl: string = chunks[3]
		? 'data:image/webp;base64,' + decompressBase64(chunks[3])
		: ''
	const photoKey: string = chunks[4] || ''
	const numberPhotos: number = Number(chunks[5] || (thumbnailUrl ? 1 : 0))

	const newNote: Note = {
		date,
		time,
		lunar,
		year,
		title,
		isTitled,
		thumbnailUrl,
		photoKey,
		numberPhotos,
		path,
		sha
	}
	return newNote
}
