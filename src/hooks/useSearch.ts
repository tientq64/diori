import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { Note } from '../store/slices/diarySlice'
import { useAppStore } from '../store/useAppStore'
import { getOctokit } from '../utils/getOctokit'
import { parseNoteFromNoteData } from '../utils/parseNote'
import { useLoadYear } from './useLoadYear'

export function useSearch() {
	const searchLoading = useAppStore((state) => state.searchLoading)
	const searchPageTotal = useAppStore((state) => state.searchPageTotal)
	const searchNotes = useAppStore((state) => state.searchNotes)
	const notes = useAppStore((state) => state.notes)
	const orgName = useAppStore((state) => state.orgName)
	const setSearchText = useAppStore((state) => state.setSearchText)
	const setSearchNotes = useAppStore((state) => state.setSearchNotes)
	const setSearchNotesTotal = useAppStore((state) => state.setSearchNotesTotal)
	const setSearchPage = useAppStore((state) => state.setSearchPage)
	const setSearchPageTotal = useAppStore((state) => state.setSearchPageTotal)
	const setSearchLoading = useAppStore((state) => state.setSearchLoading)
	const setSearchError = useAppStore((state) => state.setSearchError)

	const loadYearApi = useLoadYear()

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
				const foundYears = new Set<number>()

				for (const data of res.data.items) {
					let searchNote: Note = parseNoteFromNoteData(data)
					if (notes[searchNote.date] === undefined) {
						foundYears.add(searchNote.year)
					} else {
						searchNote = notes[searchNote.date]
					}
					newSearchNotes.push(searchNote)
				}
				for (const year of foundYears) {
					loadYearApi.run(year)
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
