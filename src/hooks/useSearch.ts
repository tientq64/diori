import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { Note } from '../store/slices/diarySlice'
import { useStore } from '../store/useStore'
import { getOctokit } from '../utils/getOctokit'
import { parseNoteFromNoteData } from '../utils/parseNote'
import { useLoadYear } from './useLoadYear'

export function useSearch() {
	const searchLoading = useStore((state) => state.searchLoading)
	const searchPageTotal = useStore((state) => state.searchPageTotal)
	const searchNotes = useStore((state) => state.searchNotes)
	const notes = useStore((state) => state.notes)
	const orgName = useStore((state) => state.orgName)
	const setSearchText = useStore((state) => state.setSearchText)
	const setSearchNotes = useStore((state) => state.setSearchNotes)
	const setSearchNotesTotal = useStore((state) => state.setSearchNotesTotal)
	const setSearchPage = useStore((state) => state.setSearchPage)
	const setSearchPageTotal = useStore((state) => state.setSearchPageTotal)
	const setSearchLoading = useStore((state) => state.setSearchLoading)
	const setSearchError = useStore((state) => state.setSearchError)

	const loadYear = useLoadYear()

	const request = useRequest(
		async (searchText: string, searchPage: number = 1) => {
			if (searchLoading) return
			if (searchPage > 1 && searchPage > searchPageTotal) return

			const rest: Octokit = getOctokit()

			if (searchPage === 1) {
				setSearchText(searchText)
				setSearchNotes([])
				setSearchNotesTotal(0)
				setSearchPage(0)
				setSearchPageTotal(0)
			}
			setSearchLoading(true)
			setSearchError(undefined)

			const q: string = `"${searchText}"+in:file+repo:${orgName}/diori-main+path:days`
			try {
				const res: any = await rest.search.code({
					q,
					page: searchPage,
					per_page: 98
				})
				const newSearchNotes: Note[] = searchPage === 1 ? [] : [...searchNotes]
				const searchNotesTotal: number = res.data.total_count
				const years = new Set<number>()
				for (const data of res.data.items) {
					let searchNote: Note = parseNoteFromNoteData(data)
					if (notes[searchNote.date] === undefined) {
						years.add(searchNote.year)
					} else {
						searchNote = notes[searchNote.date]
					}
					newSearchNotes.push(searchNote)
				}
				for (const year of years) {
					loadYear.run(year)
				}

				setSearchNotes(newSearchNotes)
				setSearchNotesTotal(searchNotesTotal)
				setSearchPage(searchPage)
				setSearchPageTotal(Math.ceil(searchNotesTotal / 98))
			} catch (error: any) {
				if (error.status === 403) {
					const limitError = Error(
						'Đã vượt quá giới hạn tìm kiếm, vui lòng đợi vài giây rồi thử lại.'
					)
					setSearchError(limitError)
				} else {
					setSearchError(error)
				}
				throw error
			} finally {
				setSearchLoading(false)
			}
		},
		{ manual: true }
	)

	return request
}
