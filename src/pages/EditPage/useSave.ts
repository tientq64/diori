import { useRequest } from 'ahooks'
import { ImageUploadItem, Toast } from 'antd-mobile'
import { find, truncate } from 'lodash'
import { getOctokit } from '../../helpers/getOctokit'
import { NoteData } from '../../store/slices/diarySlice'
import { NoteEdit, Photo } from '../../store/slices/editingSlice'
import { useStore } from '../../store/useStore'
import { compressBase64 } from '../../utils/compressBase64'
import { textToBase64 } from '../../utils/textToBase64'
import { textToCompressedBase64 } from '../../utils/textToCompressedBase64'

export function useSave() {
	const editingNote = useStore((state) => state.editingNote)
	const store = useStore()

	const request = useRequest(
		async (
			title: string,
			content: string,
			images: ImageUploadItem[],
			addedImages: ImageUploadItem[],
			removedImages: Photo[],
			defaultPhotoKey: string,
			noteEdit: NoteEdit
		) => {
			if (!editingNote) return

			const { time, sha } = editingNote

			let newTitle = title
			if (!title) {
				const longestLine = content
					.split(/\n+/)
					.map((line) => line.replace(/ +/g, ' ').trim())
					.sort((a, b) => b.length - a.length)[0]
				newTitle = truncate(longestLine, {
					length: 60,
					separator: /\s+/,
					omission: ''
				})
			}

			const defaultPhoto = find(images, { key: defaultPhotoKey })

			const chunks = [
				time.format('MMDD'),
				textToCompressedBase64(newTitle),
				title ? 'T' : '',
				defaultPhoto ? compressBase64(defaultPhoto.thumbnailUrl!.replace('data:image/webp;base64,', '')) : '',
				defaultPhotoKey.substring(2),
				images.length >= 2 ? images.length : ''
			]
			const path = `days/${editingNote.year}/${chunks.join(';').replace(/;+$/, '')}.json`
			const hasSha = sha !== undefined

			const isDeleteOnly: boolean = hasSha && !newTitle && !content && images.length === 0
			const isCreateNewOnly: boolean = !isDeleteOnly && !hasSha && path !== editingNote.path
			const isCreateNewAndDeleteOld: boolean = !isDeleteOnly && hasSha && path !== editingNote.path
			const isUpdateOnly: boolean = !isDeleteOnly && !isCreateNewOnly && !isCreateNewAndDeleteOld

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
			const newNoteEditBase64 = textToBase64(JSON.stringify(newNoteEdit))

			const rest = getOctokit()

			if (isCreateNewOnly || isCreateNewAndDeleteOld || isUpdateOnly) {
				const res = await rest.repos.createOrUpdateFileContents({
					owner: store.orgName,
					repo: 'diori-main',
					path: path,
					content: newNoteEditBase64,
					message: `Thêm/cập nhật ngày ${time.format('DD-MM-YYYY')}`,
					sha: isCreateNewOnly ? undefined : sha
				})
				store.updateOrAddNoteFromData(res.data.content as NoteData)
				console.log(1, res)
			}

			if (isDeleteOnly || isCreateNewAndDeleteOld) {
				const res = await rest.repos.deleteFile({
					owner: store.orgName,
					repo: 'diori-main',
					path: editingNote.path!,
					message: `Xóa ngày ${time.format('DD-MM-YYYY')}`,
					sha: sha!
				})
				if (isDeleteOnly) {
					store.removeNote(editingNote)
				}
				console.log(2, res)
			}

			Toast.show({
				content: 'Đã lưu',
				icon: 'success',
				position: 'bottom'
			})

			return newNoteEdit
		},
		{
			manual: true
		}
	)

	return request
}
