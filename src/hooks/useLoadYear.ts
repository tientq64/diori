import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { Note, NoteData, Status } from '../store/slices/diarySlice'
import { useAppStore } from '../store/useAppStore'
import { getOctokit } from '../utils/getOctokit'
import { parseNoteFromRawNoteData } from '../utils/parseNote'

export function useLoadYear() {
	const token = useAppStore((state) => state.token)
	const orgName = useAppStore((state) => state.orgName)
	const getYear = useAppStore((state) => state.getYear)
	const setYear = useAppStore((state) => state.setYear)
	const setOrAddNote = useAppStore((state) => state.setOrAddNote)

	const request = useRequest(
		async (year: number): Promise<boolean> => {
			if (token === '') return false

			const status: Status = getYear(year)
			if (status !== Status.Unloaded) return false

			setYear(year, Status.Loading)
			const rest: Octokit = getOctokit()

			try {
				const res = await rest.repos.getContent({
					owner: orgName,
					repo: 'diori-main',
					path: `days/${year}`
				})
				for (const data of res.data as NoteData[]) {
					const newNote: Note = parseNoteFromRawNoteData(data)
					setOrAddNote(newNote)
				}
			} catch (error: any) {
				if (error.status === 404) {
					setYear(year, Status.NotFound)
					return true
				}

				setYear(year, Status.Failed)
				throw error
			}

			setYear(year, Status.Loaded)
			return true
		},
		{ manual: true }
	)

	return request
}
