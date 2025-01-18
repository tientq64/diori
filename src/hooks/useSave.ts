import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { ImageUploadItem, Toast } from 'antd-mobile'
import { Note, NoteData } from '../store/slices/diarySlice'
import { NoteEdit, NoteEditJSON, Photo } from '../store/slices/editingSlice'
import { useAppStore } from '../store/useAppStore'
import { AddedCommitFile, commitFiles } from '../utils/commitFiles'
import { getOctokit } from '../utils/getOctokit'
import { makeCompressImageBase64 } from '../utils/makeCompressImageBase64'
import { makeNotePath } from '../utils/makeNotePath'
import { makeNoteTitleFromNoteEditContent } from '../utils/makeNoteTitleFromNoteEditContent'
import { makePhotoPath } from '../utils/makePhotoPath'
import { parseNoteFromPathAndSha, parseNoteFromRawNoteData } from '../utils/parseNote'
import { textToBase64 } from '../utils/textToBase64'

/**
 * Hook để lưu nhật ký đang viết.
 */
export function useSave() {
	const orgName = useAppStore((state) => state.orgName)
	const setOrAddNote = useAppStore((state) => state.setOrAddNote)
	const removeNote = useAppStore((state) => state.removeNote)

	const request = useRequest(
		async (
			userWrittenTitle: string,
			content: string,
			images: ImageUploadItem[],
			addedImages: ImageUploadItem[],
			removedImages: Photo[],
			defaultPhotoKey: string,
			noteEdit: NoteEdit,
			editingNote: Note
		): Promise<NoteEdit | undefined> => {
			if (editingNote === null) return

			const { time, sha, year } = editingNote

			const isTitled: boolean = userWrittenTitle !== ''

			// Tạo tiêu đề mới dựa trên nội dung đã viết nếu người dùng không đặt tiêu đề.
			const generatedTitle: string =
				userWrittenTitle || makeNoteTitleFromNoteEditContent(content)

			/**
			 * Đường dẫn mới cho file GitHub. Đường dẫn mới không nhất thiết phải khác đường dẫn cũ.
			 */
			const path: string = makeNotePath(
				time,
				generatedTitle,
				isTitled,
				defaultPhotoKey,
				images
			)
			const hasSha = sha !== undefined

			/**
			 * Chỉ xóa tập tin.
			 */
			const isDeleteOnly: boolean =
				hasSha && !generatedTitle && !content && images.length === 0
			/**
			 * Chỉ tạo mới tập tin.
			 */
			const isCreateNewOnly: boolean = !isDeleteOnly && !hasSha && path !== editingNote.path
			/**
			 * Chỉ tạo mới và xóa tập tin cũ.
			 */
			const isCreateNewAndDeleteOldOnly: boolean =
				!isDeleteOnly && hasSha && path !== editingNote.path
			/**
			 * Chỉ cập nhật tập tin.
			 */
			const isUpdateOnly: boolean =
				!isDeleteOnly && !isCreateNewOnly && !isCreateNewAndDeleteOldOnly

			/**
			 * Nội dung nhật ký mới.
			 */
			const newNoteEdit: NoteEdit = {
				date: noteEdit.date,
				title: generatedTitle,
				isTitled,
				content,
				photos: images.map<Photo>((image) => ({
					key: image.key as string,
					thumbnailUrl: image.thumbnailUrl as string
				})),
				defaultPhotoKey
			}
			/**
			 * Nội dung nhật ký được tối ưu hóa.
			 */
			const newNoteEditData: NoteEditJSON = {
				date: newNoteEdit.date,
				title: newNoteEdit.title || undefined,
				isTitled: newNoteEdit.isTitled || undefined,
				content: newNoteEdit.content,
				photos: newNoteEdit.photos.length > 0 ? newNoteEdit.photos : undefined,
				defaultPhotoKey:
					newNoteEdit.photos.length >= 2 ? newNoteEdit.defaultPhotoKey : undefined
			}
			/**
			 * Chuỗi JSON nội dung nhật ký.
			 */
			const newNoteEditJson: string = JSON.stringify(newNoteEditData)
			/**
			 * Chuỗi base64 nội dung nhật ký. Dùng để truyền dữ liệu vào các hàm GitHub API, vì API
			 * chỉ chấp nhận dữ liệu dạng base64.
			 */
			const newNoteEditBase64: string = textToBase64(newNoteEditJson)

			const rest: Octokit = getOctokit()

			if (isCreateNewOnly || isUpdateOnly) {
				const res = await rest.repos.createOrUpdateFileContents({
					owner: orgName,
					repo: 'diori-main',
					path,
					content: newNoteEditBase64,
					message: `${isCreateNewOnly ? 'Thêm' : 'Cập nhật'} ngày ${time.format('DD-MM-YYYY')}`,
					sha: isCreateNewOnly ? undefined : sha
				})
				const newNote: Note = parseNoteFromRawNoteData(res.data.content as NoteData)
				setOrAddNote(newNote)
			}

			if (isDeleteOnly) {
				await rest.repos.deleteFile({
					owner: orgName,
					repo: 'diori-main',
					path: editingNote.path!,
					message: `Xóa ngày ${time.format('DD-MM-YYYY')}`,
					sha: sha!
				})
				removeNote(editingNote)
			}

			if (isCreateNewAndDeleteOldOnly) {
				const [newNoteSHA] = await commitFiles(rest, {
					orgName,
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
				setOrAddNote(newNote)
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

			/**
			 * Tên của repo để upload ảnh lên.
			 */
			const photosRepoName = `diori-photos-${year}`

			if (isCreateNewPhotosOnly || isCreateNewAndDeletePhotosOnly) {
				// Kiểm tra xem repo để upload ảnh đã tồn tại chưa.
				// Nếu chưa tồn tại, tạo một repo mới.
				try {
					await rest.repos.get({
						owner: orgName,
						repo: photosRepoName
					})
				} catch (error: any) {
					if (error.status !== 404) throw error

					await rest.repos.createInOrg({
						org: orgName,
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

			const photosCommitMessages: string[] = []
			if (addedImages.length > 0) {
				photosCommitMessages.push(
					`Thêm ${addedImages.length} ảnh ngày ${time.format('DD-MM-YYYY')}`
				)
			}
			if (removedImages.length > 0) {
				photosCommitMessages.push(
					`Xóa ${removedImages.length} ảnh ngày ${time.format('DD-MM-YYYY')}`
				)
			}
			const photosCommitMessage: string = photosCommitMessages.join('\n')

			if (isCreateNewPhotosOnly || isCreateNewAndDeletePhotosOnly || isDeletePhotosOnly) {
				await commitFiles(rest, {
					orgName,
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
		{ manual: true }
	)
	return request
}
