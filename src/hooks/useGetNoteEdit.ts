import { useRequest } from 'ahooks'
import { getOctokit } from '../utils/getOctokit'
import { Note } from '../store/slices/diarySlice'
import { useStore } from '../store/useStore'
import { base64ToText } from '../utils/base64ToText'

export function useGetNoteEdit() {
	const store = useStore()

	const request = useRequest(
		async (note: Note) => {
			if (!note.sha) return

			const rest = getOctokit(store.token)

			const res: any = await rest.git.getBlob({
				owner: store.orgName,
				repo: 'diori-main',
				file_sha: note.sha
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
