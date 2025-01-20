import { Note, NoteData } from '../store/slices/diarySlice'
import { parseNoteFromPathAndSha } from './parseNoteFromPathAndSha'

/**
 * Phân tích thành mục nhật ký từ data.
 *
 * @param rawData Data để phân tích, là data của trường `data` trả về từ GitHub API.
 * @returns Một mục nhật ký mới.
 */
export function parseNoteFromRawData(rawData: NoteData): Note {
	const { path, sha } = rawData
	return parseNoteFromPathAndSha(path, sha)
}
