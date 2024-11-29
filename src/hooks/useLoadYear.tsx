import { useRequest } from 'ahooks'
import { Note, Status } from '../store/slices/diarySlice'
import { useStore } from '../store/useStore'
import { getOctokit } from '../utils/getOctokit'
import { parseNoteFromNoteData } from '../utils/parseNote'

export function useLoadYear() {
	const years = useStore((state) => state.years)
	const orgName = useStore((state) => state.orgName)
	const setYear = useStore((state) => state.setYear)
	const updateOrAddNote = useStore((state) => state.updateOrAddNote)

	const request = useRequest(
		async (year: number) => {
			const status: Status = years[year]
			if (status) return

			setYear(year, 'loading')
			const rest = getOctokit()

			try {
				const res = await rest.repos.getContent({
					owner: orgName,
					repo: 'diori-main',
					path: `days/${year}`
				})
				for (const data of res.data as []) {
					const newNote: Note = parseNoteFromNoteData(data)
					updateOrAddNote(newNote)
				}
			} catch (error: any) {
				if (error.status === 404) {
					setYear(year, 'loaded-404')
					return true
				}

				setYear(year, 'failed')
				throw error
			}

			setYear(year, 'loaded')
			return true
		},
		{ manual: true }
	)

	return request
}
