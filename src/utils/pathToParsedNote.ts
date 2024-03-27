import { ParsedNote } from '../store/slices/DiarySlice'

export function pathToParsedNote(path: string): ParsedNote {
	const [year, fileName] = path.split('/').slice(-2)
	const chunks = fileName.split(';')

	const date = `${year}-${chunks[0]}`

	const title = chunks[1]
	const isTitled = chunks[2] === 'T'

	const thumbnailDataURL = chunks[3]
	const photoId = chunks[4]
	const numberPhotos = Number(chunks[5])

	const parsedNote: ParsedNote = {
		date,
		title,
		isTitled,
		thumbnailDataURL,
		photoId,
		numberPhotos,
		path
	}
	return parsedNote
}
