import { SliceCreator } from '../useStore'
import { Note, NoteData } from './diarySlice'

export type NoteEdit = {
	date: string
	title: string
	isTitled: boolean
	content: string
	photos: Photo[]
	defaultPhotoKey: string
}

export type NoteEditJSON = Pick<NoteEdit, 'date'> & Partial<NoteEdit>

export type Photo = {
	key: string
	thumbnailUrl: string
}

export type Editing = {
	editingNote: Note | null

	setEditingNote: (note: Note | null) => void
}

export const editingSlice: SliceCreator<Editing> = (set) => ({
	editingNote: null,

	setEditingNote: (note) => {
		set({ editingNote: note })
	}
})
