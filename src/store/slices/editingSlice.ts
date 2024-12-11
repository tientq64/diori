import { Monaco } from '../../types/monaco'
import { SliceCreator } from '../useStore'
import { Note } from './diarySlice'

export type NoteEdit = Pick<Note, 'date' | 'title' | 'isTitled'> & {
	content: string
	photos: Photo[]
	defaultPhotoKey: string
}

export type NoteEditJSON = Pick<NoteEdit, 'date'> & Partial<NoteEdit>

export interface Photo {
	key: string
	thumbnailUrl: string
}

export interface Editing {
	editingNote: Note | null
	monaco: typeof Monaco | null

	setEditingNote: (note: Note | null) => void
}

export const editingSlice: SliceCreator<Editing> = (set) => ({
	editingNote: null,
	monaco: null,

	setEditingNote: (note) => set({ editingNote: note })
})
