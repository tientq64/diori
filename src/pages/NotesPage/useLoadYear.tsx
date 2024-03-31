import useSWRMutation from 'swr/mutation'
import { getOctokit } from '../../helpers/getOctokit'
import { Status } from '../../store/slices/diarySlice'
import { useStore } from '../../store/useStore'

export function useLoadYear() {
	const store = useStore()

	const swr = useSWRMutation('loadYear', async (_, { arg: year }: { arg: number }) => {
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
				store.updateOrAddNoteFromData(data)
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
	})

	return swr
}
