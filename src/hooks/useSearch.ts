/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRequest } from 'ahooks'
import { Note } from '../store/slices/diarySlice'
import { useStore } from '../store/useStore'
import { getOctokit } from '../utils/getOctokit'
import { parseNoteFromNoteData } from '../utils/parseNote'
import { useLoadYear } from './useLoadYear'
import { useEffect } from 'react'

export function useSearch() {
	const store = useStore()
	const loadYear = useLoadYear()

	const request = useRequest(
		async (searchText: string, searchPage: number = 1) => {
			if (store.searchLoading) return
			if (searchPage > 1 && searchPage > store.searchPageTotal) return

			const rest = getOctokit()

			if (searchPage === 1) {
				store.setSearchText(searchText)
				store.setSearchNotes([])
				store.setSearchNotesTotal(0)
				store.setSearchPage(0)
				store.setSearchPageTotal(0)
			}
			store.setSearchLoading(true)
			store.setSearchError(undefined)

			const q: string = `"${searchText}"+in:file+repo:${store.orgName}/diori-main+path:days`
			try {
				const res: any = await rest.search.code({
					q,
					page: searchPage,
					per_page: 98
				})
				const searchNotes: Note[] = searchPage === 1 ? [] : [...store.searchNotes]
				const searchNotesTotal: number = res.data.total_count
				const years = new Set<number>()
				for (const data of res.data.items) {
					const searchNote: Note = parseNoteFromNoteData(data)
					searchNotes.push(searchNote)
					years.add(searchNote.year)
				}
				for (const year of years) {
					loadYear.run(year)
				}

				store.setSearchNotes(searchNotes)
				store.setSearchNotesTotal(searchNotesTotal)
				store.setSearchPage(searchPage)
				store.setSearchPageTotal(Math.ceil(searchNotesTotal / 98))
			} catch (error: any) {
				if (error.status === 403) {
					const limitError = Error(
						'Đã vượt quá giới hạn tìm kiếm, vui lòng đợi vài giây rồi thử lại.'
					)
					store.setSearchError(limitError)
				} else {
					store.setSearchError(error)
				}
				throw error
			} finally {
				store.setSearchLoading(false)
			}
		},
		{
			manual: true
		}
	)

	useEffect(() => {
		const searchNotes: Note[] = store.searchNotes.map(
			(searchNote: Note): Note => store.notes[searchNote.date] ?? searchNote
		)
		store.setSearchNotes(searchNotes)
	}, [store.notes])

	return request
}
