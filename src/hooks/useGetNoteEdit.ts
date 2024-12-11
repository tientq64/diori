import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { Note } from '../store/slices/diarySlice'
import { NoteEdit, NoteEditJSON } from '../store/slices/editingSlice'
import { useStore } from '../store/useStore'
import { base64ToText } from '../utils/base64ToText'
import { getOctokit } from '../utils/getOctokit'

export function useGetNoteEdit() {
	const token = useStore((state) => state.token)
	const orgName = useStore((state) => state.orgName)

	const request = useRequest(
		async (note: Note): Promise<NoteEdit | undefined> => {
			if (note.sha === undefined) return

			const rest: Octokit = getOctokit(token)

			const res: any = await rest.git.getBlob({
				owner: orgName,
				repo: 'diori-main',
				file_sha: note.sha
			})
			const noteEditData: NoteEditJSON = JSON.parse(base64ToText(res.data.content))

			const noteEdit: NoteEdit = {
				date: noteEditData.date,
				title: noteEditData.title ?? '',
				isTitled: noteEditData.isTitled ?? false,
				content: noteEditData.content ?? '',
				photos: noteEditData.photos ?? [],
				defaultPhotoKey: noteEditData.defaultPhotoKey ?? noteEditData.photos?.[0].key ?? ''
			}

			return noteEdit
		},
		{ manual: true }
	)

	return request
}
