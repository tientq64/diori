import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { ImageUploadItem, Toast } from 'antd-mobile'
import { Note, NoteData } from '../store/slices/diarySlice'
import { NoteEdit, Photo } from '../store/slices/editingSlice'
import { useAppStore } from '../store/useAppStore'
import { AddedCommitFile, commitAndPushFiles } from '../utils/commitAndPushFiles'
import { getOctokit } from '../utils/getOctokit'
import { makeCompressImageBase64 } from '../utils/makeCompressImageBase64'
import { makeNotePath } from '../utils/makeNotePath'
import { makeNoteTitleFromContent } from '../utils/makeNoteTitleFromContent'
import { makePhotoPath } from '../utils/makePhotoPath'
import { parseNoteFromPathAndSha } from '../utils/parseNoteFromPathAndSha'
import { parseNoteFromRawData } from '../utils/parseNoteFromRawData'
import { stringifyNoteEdit } from '../utils/stringifyNoteEdit'
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
			const generatedTitle: string = userWrittenTitle || makeNoteTitleFromContent(content)

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
			const hasSha: boolean = sha !== undefined

			const displayDate: string = time.format('DD-MM-YYYY')

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
			 * Chuỗi JSON nội dung nhật ký.
			 */
			const newNoteEditJson: string = stringifyNoteEdit(newNoteEdit)

			/**
			 * Chuỗi base64 nội dung nhật ký. Dùng để truyền dữ liệu vào các hàm GitHub API, vì API
			 * chỉ chấp nhận dữ liệu dạng base64.
			 */
			const newNoteEditBase64: string = textToBase64(newNoteEditJson)

			const rest: Octokit = getOctokit()

			if (isCreateNewOnly || isUpdateOnly) {
				const message: string = isCreateNewOnly
					? `Thêm ngày ${displayDate}`
					: `Cập nhật ngày ${displayDate}`
				const res = await rest.repos.createOrUpdateFileContents({
					owner: orgName,
					repo: 'diori-main',
					path,
					content: newNoteEditBase64,
					message,
					sha: isCreateNewOnly ? undefined : sha
				})
				const newNote: Note = parseNoteFromRawData(res.data.content as NoteData)
				setOrAddNote(newNote)
			}

			if (isDeleteOnly) {
				await rest.repos.deleteFile({
					owner: orgName,
					repo: 'diori-main',
					path: editingNote.path!,
					message: `Xóa ngày ${displayDate}`,
					sha: sha!
				})
				removeNote(editingNote)
			}

			if (isCreateNewAndDeleteOldOnly) {
				const [newNoteSHA] = await commitAndPushFiles(rest, {
					orgName,
					repoName: 'diori-main',
					message: `Tạo lại ngày ${displayDate}`,
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
				photosCommitMessages.push(`Thêm ${addedImages.length} ảnh ngày ${displayDate}`)
			}
			if (removedImages.length > 0) {
				photosCommitMessages.push(`Xóa ${removedImages.length} ảnh ngày ${displayDate}`)
			}
			const photosCommitMessage: string = photosCommitMessages.join('\n')

			if (isCreateNewPhotosOnly || isCreateNewAndDeletePhotosOnly || isDeletePhotosOnly) {
				await commitAndPushFiles(rest, {
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
