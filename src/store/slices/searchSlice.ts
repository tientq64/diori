import { SliceCreator } from '../useStore'
import { Note } from './diarySlice'

export type Search = {
	searchText: string
	searchNotes: Note[]
	searchNotesTotal: number
	searchPage: number
	searchPageTotal: number
	searchLoading: boolean
	searchError: any

	setSearchText: (searchText: string) => void
	setSearchNotes: (searchNotes: Note[]) => void
	setSearchNotesTotal: (searchNotesTotal: number) => void
	setSearchPage: (searchPage: number) => void
	setSearchPageTotal: (searchPageTotal: number) => void
	setSearchLoading: (searchLoading: boolean) => void
	setSearchError: (searchError: any) => void
}

export const searchSlice: SliceCreator<Search> = (set) => ({
	searchText: '',
	searchNotes: [],
	searchNotesTotal: 0,
	searchPage: 0,
	searchPageTotal: 0,
	searchLoading: false,
	searchError: undefined,

	setSearchText: (searchText) => set({ searchText }),
	setSearchNotes: (searchNotes) => set({ searchNotes }),
	setSearchNotesTotal: (searchNotesTotal) => set({ searchNotesTotal }),
	setSearchPage: (searchPage) => set({ searchPage }),
	setSearchPageTotal: (searchPageTotal) => set({ searchPageTotal }),
	setSearchLoading: (searchLoading) => set({ searchLoading }),
	setSearchError: (searchError) => set({ searchError })
})
