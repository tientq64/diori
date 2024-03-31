import { Octokit } from '@octokit/rest'
import useSWRMutation from 'swr/mutation'
import { Note } from '../../store/slices/diarySlice'
import { useStore } from '../../store/useStore'
import { base64ToText } from '../../utils/base64ToText'

export function useGetNoteEdit() {
	const store = useStore()

	const swr = useSWRMutation('getNoteEdit', async (_, { arg: note }: { arg: Note }) => {
		if (!note.path) return

		const rest = new Octokit({ auth: store.token })

		const res: any = await rest.repos.getContent({
			owner: store.orgName,
			repo: 'diori-main',
			path: note.path
		})
		const noteEdit = JSON.parse(base64ToText(res.data.content))

		return noteEdit
	})

	return swr
}
