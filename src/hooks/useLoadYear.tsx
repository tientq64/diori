import { useRequest } from 'ahooks'
import { getOctokit } from '../utils/getOctokit'
import { Note, Status } from '../store/slices/diarySlice'
import { useStore } from '../store/useStore'
import { parseNoteFromNoteData } from '../utils/parseNote'

export function useLoadYear() {
	const store = useStore()

	const request = useRequest(
		async (year: number) => {
			const status: Status = store.years[year]

			if (status) return

			store.setYear(year, 'loading')

			const rest = getOctokit()
			try {
				const res = await rest.repos.getContent({
					owner: store.orgName,
					repo: 'diori-main',
					path: `days/${year}`
				})
				for (const data of res.data as []) {
					const newNote: Note = parseNoteFromNoteData(data)
					store.updateOrAddNote(newNote)
				}
			} catch (error: any) {
				if (error.status === 404) {
					store.setYear(year, 'loaded-404')
					return true
				}

				store.setYear(year, 'failed')
				throw error
			}

			store.setYear(year, 'loaded')
			return true
		},
		{
			manual: true
		}
	)

	return request
}
