import { useRequest } from 'ahooks'
import { ImageUploadItem, Toast } from 'antd-mobile'
import { find, truncate } from 'lodash'
import { Note, NoteData } from '../store/slices/diarySlice'
import { NoteEdit, NoteEditJSON, Photo } from '../store/slices/editingSlice'
import { useStore } from '../store/useStore'
import { AddedCommitFile, commitFiles } from '../utils/commitFiles'
import { compressBase64 } from '../utils/compressBase64'
import { getOctokit } from '../utils/getOctokit'
import { makeCompressImageBase64 } from '../utils/makeCompressImageBase64'
import { makePhotoPath } from '../utils/makePhotoPath'
import { parseNoteFromNoteData, parseNoteFromPathAndSha } from '../utils/parseNote'
import { textToBase64 } from '../utils/textToBase64'
import { textToCompressedBase64 } from '../utils/textToCompressedBase64'

export function useSave() {
	const editingNote = useStore<Note | null>((state) => state.editingNote)
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
		): Promise<NoteEdit | void> => {
			if (editingNote === null) return

			const { time, sha, year } = editingNote

			/** Tiêu đề mới, hoặc tiêu đề cũ nếu có. */
			let newTitle: string = title
			if (!title && content.length) {
				const longestLine: string = content
					.split(/\n+/)
					.map((line) => line.replace(/ +/g, ' ').trim())
					.filter((line) => !/^\[.+?\]: *[^"\n]+?(?: *".+?")?$/.test(line[0]))
					.sort((a, b) => b.length - a.length)[0]
				newTitle = truncate(longestLine, {
					length: 60,
					separator: /\s+/,
					omission: ''
				})
			}

			/** Ảnh mặc định. */
			const defaultPhoto: ImageUploadItem | undefined = find(images, { key: defaultPhotoKey })

			const chunks = [
				time.format('MMDD'),
				textToCompressedBase64(newTitle),
				title ? 'T' : '',
				defaultPhoto
					? compressBase64(
							defaultPhoto.thumbnailUrl!.replace('data:image/webp;base64,', '')
						)
					: '',
				defaultPhotoKey.substring(2),
				images.length >= 2 ? images.length : ''
			]
			const path = `days/${year}/${chunks.join(';').replace(/;+$/, '')}.json`
			const hasSha = sha !== undefined

			const isDeleteOnly: boolean = hasSha && !newTitle && !content && images.length === 0
			const isCreateNewOnly: boolean = !isDeleteOnly && !hasSha && path !== editingNote.path
			const isCreateNewAndDeleteOldOnly: boolean =
				!isDeleteOnly && hasSha && path !== editingNote.path
			const isUpdateOnly: boolean =
				!isDeleteOnly && !isCreateNewOnly && !isCreateNewAndDeleteOldOnly

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
			const newNoteEditData: NoteEditJSON = {
				date: newNoteEdit.date,
				title: newNoteEdit.title || undefined,
				isTitled: newNoteEdit.isTitled || undefined,
				content: newNoteEdit.content || '',
				photos: newNoteEdit.photos.length > 0 ? newNoteEdit.photos : undefined,
				defaultPhotoKey:
					newNoteEdit.photos.length >= 2 ? newNoteEdit.defaultPhotoKey : undefined
			}
			const newNoteEditJson: string = JSON.stringify(newNoteEditData)
			const newNoteEditBase64: string = textToBase64(newNoteEditJson)

			const rest = getOctokit()

			if (isCreateNewOnly || isUpdateOnly) {
				const res = await rest.repos.createOrUpdateFileContents({
					owner: store.orgName,
					repo: 'diori-main',
					path: path,
					content: newNoteEditBase64,
					message: `${isCreateNewOnly ? 'Thêm' : 'Cập nhật'} ngày ${time.format('DD-MM-YYYY')}`,
					sha: isCreateNewOnly ? undefined : sha
				})
				const newNote: Note = parseNoteFromNoteData(res.data.content as NoteData)
				store.updateOrAddNote(newNote)
			}

			if (isDeleteOnly) {
				await rest.repos.deleteFile({
					owner: store.orgName,
					repo: 'diori-main',
					path: editingNote.path!,
					message: `Xóa ngày ${time.format('DD-MM-YYYY')}`,
					sha: sha!
				})
				store.removeNote(editingNote)
			}

			if (isCreateNewAndDeleteOldOnly) {
				const [newNoteSHA] = await commitFiles(rest, {
					orgName: store.orgName,
					repoName: 'diori-main',
					message: `Tạo lại ngày ${time.format('DD-MM-YYYY')}`,
					addedFiles: [
						{
							path,
							content: newNoteEditBase64
						}
					],
					deletedPaths: editingNote.path ? [editingNote.path] : []
				})
				const newNote: Note = parseNoteFromPathAndSha(path, newNoteSHA)
				store.updateOrAddNote(newNote)
			}

			const isCreateNewPhotosOnly: boolean =
				addedImages.length > 0 && removedImages.length === 0
			const isCreateNewAndDeletePhotosOnly: boolean =
				addedImages.length > 0 && removedImages.length > 0
			const isDeletePhotosOnly: boolean = addedImages.length === 0 && removedImages.length > 0

			const addedFiles: AddedCommitFile[] = []
			for (const image of addedImages) {
				const imageContent: string = await makeCompressImageBase64(image.url)
				const addedFile: AddedCommitFile = {
					path: makePhotoPath(time, image.key as string),
					content: imageContent
				}
				addedFiles.push(addedFile)
			}

			const photosRepoName = `diori-photos-${year}`

			if (isCreateNewPhotosOnly || isCreateNewAndDeletePhotosOnly) {
				try {
					await rest.repos.get({
						owner: store.orgName,
						repo: photosRepoName
					})
				} catch (error: any) {
					if (error.status !== 404) throw error

					await rest.repos.createInOrg({
						org: store.orgName,
						name: photosRepoName,
						private: true,
						description: `Ảnh năm ${year}.`,
						auto_init: true,
						has_issues: false,
						has_projects: false,
						has_wiki: false
					})
				}
			}

			let photosCommitMessage: string = ''
			if (addedImages.length > 0) {
				photosCommitMessage += `Thêm ${addedImages.length} ảnh ngày ${time.format('DD-MM-YYYY')}\n`
			}
			if (removedImages.length > 0) {
				photosCommitMessage += `Xóa ${removedImages.length} ảnh ngày ${time.format('DD-MM-YYYY')}\n`
			}
			photosCommitMessage = photosCommitMessage.trimEnd()

			if (isCreateNewPhotosOnly || isCreateNewAndDeletePhotosOnly || isDeletePhotosOnly) {
				await commitFiles(rest, {
					orgName: store.orgName,
					repoName: photosRepoName,
					message: photosCommitMessage,
					addedFiles,
					deletedPaths: removedImages.map((image) => makePhotoPath(time, image.key))
				})
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
