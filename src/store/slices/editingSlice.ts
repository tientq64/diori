import { SliceCreator } from '../useStore'
import { Note } from './diarySlice'

export interface NoteEdit {
	readonly date: string
	title: string
	isTitled: boolean
	content: string
	photos: Photo[]
	defaultPhotoKey: string
}

export type NoteEditJSON = Pick<NoteEdit, 'date'> & Partial<NoteEdit>

export interface Photo {
	key: string
	thumbnailUrl: string
}

export type Editing = {
	editingNote: Note | null

	setEditingNote: (note: Note | null) => void
}

export const editingSlice: SliceCreator<Editing> = (set) => ({
	editingNote: null,

	setEditingNote: (note) => set({ editingNote: note })
})
