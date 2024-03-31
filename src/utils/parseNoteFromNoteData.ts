import dayjs from 'dayjs'
import { Note, NoteData } from '../store/slices/diarySlice'
import { minBase64ToBase64 } from './minBase64ToBase64'
import { minBase64ToText } from './minBase64ToText'
import VietnameseDate from 'vietnamese-date'

export function parseNoteFromNoteData(data: NoteData): Note {
	const { path, sha } = data

	const [yearStr, fileName] = path.split('/').slice(-2)
	const year = Number(yearStr)
	const chunks = fileName.split(';')

	const time = dayjs(year + chunks[0])
	const date = time.format('YYYY-MM-DD')

	const title = minBase64ToText(chunks[1])
	const isTitled = chunks[2] === 'T'

	const thumbnailUrl = chunks[3] ? 'data:image/webp;base64,' + minBase64ToBase64(chunks[3]) : ''
	const photoKey = chunks[4] ? time.format('DD') + chunks[4] : ''
	const numberPhotos = Number(chunks[5] || (thumbnailUrl ? 1 : 0))

	const note: Note = {
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
	return note
}
