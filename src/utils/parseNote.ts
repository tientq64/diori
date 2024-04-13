import dayjs from 'dayjs'
import { Note, NoteData } from '../store/slices/diarySlice'
import { decompressBase64 } from './decompressBase64'
import { compressedBase64ToText } from './compressedBase64ToText'
import VietnameseDate from 'vietnamese-date'

/**
 * Phân tích cú pháp mục nhật ký từ path file GitHub và SHA.
 * @param path Đường dẫn file GitHub của mục nhật ký này.
 * @param sha SHA của file GitHub.
 * @returns Một mục nhật ký mới.
 */
export function parseNoteFromPathAndSha(path: string, sha: string): Note {
	let [yearStr, fileName] = path.split('/').slice(-2)
	const year = Number(yearStr)
	const chunks = fileName.replace(/\.json$/, '').split(';')

	const time = dayjs(year + chunks[0])
	const date = time.format('YYYY-MM-DD')

	const title = compressedBase64ToText(chunks[1])
	const isTitled = chunks[2] === 'T'

	const thumbnailUrl = chunks[3] ? 'data:image/webp;base64,' + decompressBase64(chunks[3]) : ''
	const photoKey = chunks[4] ? time.format('DD') + chunks[4] : ''
	const numberPhotos = Number(chunks[5] || (thumbnailUrl ? 1 : 0))

	const newNote: Note = {
		date,
		time,
		lunar: new VietnameseDate(time.toDate()),
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

/**
 * Phân tích cú pháp mục nhật ký từ data.
 * @param data Data để phân tích cú pháp, thường là data của trường data trả về từ REST API.
 * @returns Một mục nhật ký mới
 */
export function parseNoteFromNoteData(data: NoteData): Note {
	let { path, sha } = data
	return parseNoteFromPathAndSha(path, sha)
}
