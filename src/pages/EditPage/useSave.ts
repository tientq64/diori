import { ImageUploadItem } from 'antd-mobile'
import { find, isTypedArray, replace, truncate } from 'lodash'
import useSWRMutation from 'swr/mutation'
import { getOctokit } from '../../helpers/getOctokit'
import { NoteEdit, Photo } from '../../store/slices/editingSlice'
import { useStore } from '../../store/useStore'
import { textToMinBase64 } from '../../utils/textToMinBase64'
import { base64ToMinBase64 } from '../../utils/base64ToMinBase64'

type SaveTriggerArg = [string, string, ImageUploadItem[], ImageUploadItem[], Photo[], string, NoteEdit]

export function useSave() {
	const editingNote = useStore((state) => state.editingNote)

	const swr = useSWRMutation('save', async (_, options: { arg: SaveTriggerArg }) => {
		if (!editingNote) return

		const [title, content, images, addedImages, removedImages, defaultPhotoKey, noteEdit] = options.arg

		let newTitle = title
		if (!title) {
			const longestLine = content
				.split(/\n+/)
				.map((line) => line.replace(/ +/g, ' ').trim())
				.sort((a, b) => b.length - a.length)[0]
			newTitle = truncate(longestLine, {
				length: 65,
				separator: /\s+/,
				omission: ''
			})
		}

		const defaultPhoto = find(images, { key: defaultPhotoKey })

		const chunks = [
			editingNote.time.format('MMDD'),
			textToMinBase64(newTitle),
			title ? 'T' : '',
			defaultPhoto ? base64ToMinBase64(defaultPhoto.thumbnailUrl!.replace('data:image/webp;base64,', '')) : '',
			defaultPhotoKey.substring(2),
			images.length >= 2 ? images.length : ''
		]
		const path = `days/${editingNote.year}/${chunks.join(';').replace(/;+$/, '')}`
		const isNewPath = path !== editingNote.path

		const newNoteEdit: NoteEdit = {
			date: noteEdit.date,
			title: newTitle,
			isTitled: title.length > 0,
			content: content,
			photos: images.map<Photo>((image) => ({
				key: image.key as string,
				thumbnailUrl: image.thumbnailUrl as string
			})),
			defaultPhotoKey
		}
	})

	return swr
}
