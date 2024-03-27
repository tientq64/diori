import { NoteData, ParsedNote } from '../store/slices/DiarySlice'
import { pathToParsedNote } from './pathToParsedNote'

export function noteDataToParsedNote(data: NoteData): ParsedNote {
	const parsedNote: ParsedNote = {
		sha: data.sha,
		...pathToParsedNote(data.path)
	}
	return parsedNote
}
