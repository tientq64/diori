import { RestEndpointMethodTypes } from '@octokit/rest'
import { Dayjs } from 'dayjs'
import { noteDataToParsedNote } from '../../utils/noteDataToParsedNote'
import { SliceCreator } from '../useStore'

export type Note = {
	date: string
	time: Dayjs
	title: string
	isTitled: boolean
	thumbnailDataURL: string
	photoId: string
	numberPhotos: number
	path?: string
	sha?: string
}
export type ParsedNote = Pick<
	Note,
	'date' | 'title' | 'isTitled' | 'thumbnailDataURL' | 'photoId' | 'numberPhotos' | 'path' | 'sha'
>
export type Notes = Record<Note['date'], Note>

export type NoteData = Required<
	NonNullable<
		RestEndpointMethodTypes['repos']['createOrUpdateFileContents']['response']['data']['content']
	>
>

export type Year = undefined | 'loading' | 'loaded' | 'unloaded'
export type Years = Record<string, Year>

export type Diary = {
	notes: Notes
	years: Years

	addNoteOnce: (note: Note) => void
	updateNoteFromNoteData: (data: NoteData) => void
}

export const diarySlice: SliceCreator<Diary> = (set) => ({
	notes: {},
	years: {},

	addNoteOnce: (note) => {
		set((state) => {
			state.notes[note.date] ??= note
		})
	},

	updateNoteFromNoteData: (data) => {
		set((state) => {
			const parsedNote = noteDataToParsedNote(data)
			const note = state.notes[parsedNote.date]
			Object.assign(note, parsedNote)
		})
	}
})
