import { useRequest } from 'ahooks'
import { getOctokit } from '../../helpers/getOctokit'
import { Note } from '../../store/slices/diarySlice'
import { useStore } from '../../store/useStore'
import { base64ToText } from '../../utils/base64ToText'

export function useGetNoteEdit() {
	const store = useStore()

	const request = useRequest(
		async (note: Note) => {
			if (!note.path) return

			const rest = getOctokit(store.token)

			const res: any = await rest.repos.getContent({
				owner: store.orgName,
				repo: 'diori-main',
				path: note.path
			})
			const noteEdit = JSON.parse(base64ToText(res.data.content))

			return noteEdit
		},
		{
			manual: true
		}
	)

	return request
}
