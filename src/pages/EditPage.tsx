import { Fancybox } from '@fancyapps/ui'
import '@fancyapps/ui/dist/fancybox/fancybox.css'
import { slideType } from '@fancyapps/ui/types/Carousel/types'
import { Editor } from '@monaco-editor/react'
import {
	Button,
	Dialog,
	Divider,
	ImageUploader,
	Input,
	NavBar,
	Popover,
	Skeleton,
	TextArea,
	Toast
} from 'antd-mobile'
import {
	DeleteOutline,
	EyeOutline,
	InformationCircleOutline,
	PictureOutline
} from 'antd-mobile-icons'
import { produce } from 'immer'
import { differenceBy, find, findIndex, reject, some, upperFirst } from 'lodash'
import { nanoid } from 'nanoid'
import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Blocker, Navigate, useBlocker, useLocation, useNavigate, useParams } from 'react-router'
import spinnerImage from '../assets/images/spinner.svg'
import { EntitiesManagerButton } from '../components/EntitiesManagerButton'
import { QuickSettingsButton } from '../components/QuickSettingsButton'
import { useEditorOptions } from '../hooks/useEditorOptions'
import { useGetNoteEdit } from '../hooks/useGetNoteEdit'
import { useLoadYear } from '../hooks/useLoadYear'
import { usePhotosLoader } from '../hooks/usePhotosLoader'
import { useSave } from '../hooks/useSave'
import { Note, Status } from '../store/slices/diarySlice'
import { NoteEdit, Photo } from '../store/slices/editingSlice'
import { useAppStore } from '../store/useAppStore'
import { CodeEditor, EditorOptions, FindMatch, IEditorAction, Monaco } from '../types/monaco'
import { checkIsLoadedStatus } from '../utils/checkIsLoadedStatus'
import { setupEditor } from '../utils/editor/setupEditor'
import { makeThumbnailUrl } from '../utils/makeThumbnailUrl'

export interface ImageUploadItem {
	key?: string | number
	url: string
	thumbnailUrl?: string
	extra?: any
	loadUrlPromise?: Promise<string>
}

export function EditPage(): ReactNode {
	const params = useParams()

	if (params.date === undefined || !/^\d{4}-\d\d-\d\d$/.test(params.date)) {
		return <Navigate to="/login" replace />
	}

	const dateParam: string = params.date
	const getNote = useAppStore((state) => state.getNote)
	const makeNote = useAppStore((state) => state.makeNote)

	const editingNote = useMemo<Note>(() => {
		return getNote(dateParam) ?? makeNote(dateParam)
	}, [getNote(dateParam)])

	const isMd = useAppStore((state) => state.isMd)
	const isDarkMode = useAppStore((state) => state.isDarkMode)
	const fontSize = useAppStore((state) => state.fontSize)
	const monaco = useAppStore((state) => state.monaco)
	const setEditingNote = useAppStore((state) => state.setEditingNote)
	const getYear = useAppStore((state) => state.getYear)

	const location = useLocation()
	const navigate = useNavigate()
	const getNoteEditApi = useGetNoteEdit()
	const loadYearApi = useLoadYear()
	const saveApi = useSave()
	const [title, setTitle] = useState<string>('')
	const [content, setContent] = useState<string>('')
	const [images, setImages] = useState<ImageUploadItem[]>([])
	const [maxImagesCount] = useState<number>(4)
	const [defaultPhotoKey, setDefaultPhotoKey] = useState<string>('')
	const usedPhotoKeys = useRef<string[]>([])
	const photosLoader = usePhotosLoader()
	const editorRef = useRef<CodeEditor | null>(null)
	const editorDisposer = useRef<Monaco.IDisposable>()
	const [previewImageVisible, setPreviewImageVisible] = useState<boolean>(false)
	const previewerRef = useRef<Fancybox | null>(null)

	const editorOptions: EditorOptions = useEditorOptions()

	const [noteEdit, setNoteEdit] = useState<NoteEdit>({
		date: editingNote.date,
		title: '',
		isTitled: false,
		content: '',
		photos: [],
		defaultPhotoKey: ''
	})

	const addedImages = useMemo<ImageUploadItem[]>(() => {
		return differenceBy(images, noteEdit.photos, 'key')
	}, [images, noteEdit.photos])

	const removedImages = useMemo<Photo[]>(() => {
		return differenceBy(noteEdit.photos, images, 'key')
	}, [images, noteEdit.photos])

	const currentErrorMessage = useMemo<string | undefined>(() => {
		if (title.length > 0 && title.trim() === '') {
			return 'Tiêu đề không được chứa chỉ toàn khoảng trắng'
		}
		if (title.length > 60) {
			return `Tiêu đề tối đa 60 ký tự, hãy xóa bớt ${title.length - 60} ký tự`
		}
		if (content.length > 0 && content.trim() === '') {
			return 'Nội dung không được chứa chỉ toàn khoảng trắng'
		}
		if (content.length > 10000) {
			return `Nội dung tối đa 10,000 ký tự, hãy xóa bớt ${content.length - 10000} ký tự`
		}
		if (images.length > 4) {
			return 'Tối đa 4 hình ảnh'
		}
	}, [title, content, images])

	const yearStatus: Status = getYear(editingNote.year)
	const isYearStatusLoaded: boolean = checkIsLoadedStatus(yearStatus)

	const isLoading = useMemo<boolean>(() => {
		return getNoteEditApi.loading || !isYearStatusLoaded
	}, [getNoteEditApi.loading, isYearStatusLoaded])

	const unsaved = useMemo<boolean>(() => {
		if (getNoteEditApi.loading) return false

		if (content !== noteEdit.content) return true
		if (noteEdit.isTitled ? title !== noteEdit.title : title) return true
		if (addedImages.length > 0 || removedImages.length > 0) return true
		if (defaultPhotoKey !== noteEdit.defaultPhotoKey) return true

		return false
	}, [
		getNoteEditApi.loading,
		title,
		content,
		addedImages,
		removedImages,
		defaultPhotoKey,
		noteEdit
	])

	const canSave = useMemo<boolean>(() => {
		if (saveApi.loading) return false
		if (!unsaved) return false
		if (previewImageVisible) return false

		return true
	}, [saveApi.loading, unsaved, previewImageVisible])

	const blocker: Blocker = useBlocker(unsaved || saveApi.loading)

	const beforeEditorMount = (monaco: typeof Monaco): void => {
		useAppStore.setState({ monaco })
		editorDisposer.current?.dispose()
		editorDisposer.current = setupEditor()
	}

	const handleEditorMount = (editor: CodeEditor, monaco: typeof Monaco): void => {
		editorRef.current = editor

		const model = editor.getModel()
		if (!model) return

		model.setEOL(monaco.editor.EndOfLineSequence.LF)

		const { CtrlCmd, chord } = monaco.KeyMod
		const { KeyCode } = monaco
		const { KeyK } = KeyCode

		editor.addCommand(chord(CtrlCmd | KeyK, CtrlCmd | KeyCode.KeyL), (): void => {
			const action = editor.getAction('editor.action.transformToLowercase')
			action?.run()
		})

		editor.addCommand(chord(CtrlCmd | KeyK, CtrlCmd | KeyCode.KeyU), (): void => {
			const action = editor.getAction('editor.action.transformToUppercase')
			action?.run()
		})

		editor.addCommand(chord(CtrlCmd | KeyK, CtrlCmd | KeyCode.KeyE), (): void => {
			const action = editor.getAction('editor.action.transformToTitlecase')
			action?.run()
		})

		if (location.state?.findText) {
			const matched: FindMatch | undefined = model
				.findMatches(location.state.findText, false, false, false, null, true)
				.at(0)
			if (matched !== undefined) {
				editor.setSelection(matched.range)
				const action: IEditorAction | null = editor.getAction('actions.find')
				if (action !== null) {
					action.run()
					setTimeout(editor.setScrollTop.bind(editor), 10, 0)
				}
			}
		}
	}

	/**
	 * Lọc tập tin ảnh cần tải lên.
	 *
	 * @returns Trả về `null` nếu tập tin không hợp lệ, còn không trả về tập tin đó.
	 */
	const filterValidImageFile = (file: File): File | null => {
		if (!/^image\/(jpeg|webp|png)$/.test(file.type)) {
			Toast.show('Tập tin đã chọn không phải hình ảnh hợp lệ')
			return null
		}
		return file
	}

	/**
	 * Trả về đối tượng ảnh cần tải lên của component `ImageUploader`.
	 *
	 * @param file Tập tin ảnh.
	 * @returns Đối tượng ảnh.
	 */
	const makeImageFromFile = async (file: File): Promise<ImageUploadItem> => {
		const url = URL.createObjectURL(file)
		const thumbnailUrl = await makeThumbnailUrl(url)
		let key: string
		do {
			key = nanoid(6)
		} while (usedPhotoKeys.current.includes(key))
		usedPhotoKeys.current.push(key)
		const image: ImageUploadItem = { key, thumbnailUrl, url }
		return image
	}

	/**
	 * Mở trình xem ảnh.
	 *
	 * @param image Ảnh cần xem.
	 */
	const showPreviewImage = (image: ImageUploadItem): void => {
		const startIndex: number = findIndex(images, { key: image.key })
		setPreviewImageVisible(true)

		previewerRef.current = new Fancybox(
			images.map((image2) => ({
				src: spinnerImage,
				thumbSrc: image2.thumbnailUrl,
				id: image2.key as string
			})),
			{
				mainClass: 'z-50',
				startIndex,
				on: {
					'Carousel.selectSlide': async (_, __, slide: slideType): Promise<void> => {
						const image: ImageUploadItem | undefined = find(images, { key: slide.id })
						if (image === undefined) return
						const url: string = await loadImagePhotoUrl(image)
						const imageEl = slide.imageEl as HTMLImageElement | undefined
						if (imageEl === undefined) return
						imageEl.src = url
					},
					close: closePreviewImage
				}
			}
		)
	}

	/**
	 * Đóng trình xem ảnh.
	 */
	const closePreviewImage = (): void => {
		setPreviewImageVisible(false)
		if (previewerRef.current === null) return
		previewerRef.current.destroy()
	}

	/**
	 * Lấy data URL của ảnh.
	 *
	 * @param image Ảnh chuẩn bị tải lên hoặc ảnh đã tải lên rồi.
	 * @returns Data URL của ảnh.
	 */
	const loadImagePhotoUrl = async (image: ImageUploadItem): Promise<string> => {
		if (image.url) {
			return image.url
		}
		if (image.loadUrlPromise) {
			return image.loadUrlPromise
		}
		const loadUrlPromise: Promise<string> = photosLoader.runAsync(editingNote.time, image)
		image.loadUrlPromise = loadUrlPromise
		const blobUrl: string = await loadUrlPromise
		setImages(
			produce((images) => {
				const image2 = find(images, { key: image.key })
				if (image2 === undefined) return
				image2.url = blobUrl
			})
		)
		return blobUrl
	}

	/**
	 * Loại bỏ hình ảnh.
	 */
	const removeImage = (image: ImageUploadItem): void => {
		setImages(reject(images, { key: image.key }))
	}

	/**
	 * Khôi phục lại hình ảnh đã loại bỏ. Những hình ảnh đã được lưu mới có thể khôi phục được.
	 */
	const restoreRemovedPhoto = (photo: Photo): void => {
		if (images.length >= maxImagesCount) {
			Toast.show('Danh sách không thể nhiều hơn 4 hình ảnh')
			return
		}
		const image = photo as ImageUploadItem
		setImages([...images, image])
	}

	const handleSave = (): void => {
		if (!canSave) return
		if (currentErrorMessage !== undefined) return
		saveApi.run(
			title,
			content,
			images,
			addedImages,
			removedImages,
			defaultPhotoKey,
			noteEdit,
			editingNote
		)
	}

	useHotkeys(
		'ctrl+s',
		() => {
			handleSave()
		},
		{
			preventDefault: true,
			enableOnFormTags: true,
			enabled: () => canSave
		}
	)

	useEffect(() => {
		if (blocker.state !== 'blocked') return
		if (saveApi.loading) {
			Toast.show('Không thể trở về trong khi đang lưu')
			return
		}
		Dialog.show({
			title: 'Dữ liệu chưa được lưu',
			content: 'Dữ liệu chưa được lưu sẽ bị mất, bạn vẫn muốn trở về?',
			closeOnMaskClick: true,
			closeOnAction: true,
			actions: [
				{
					key: 'save',
					text: 'Lưu',
					bold: true,
					onClick: () => {
						handleSave()
					}
				},
				{
					key: 'back',
					text: 'Bỏ các thay đổi và trở về',
					danger: true,
					onClick: () => {
						blocker.proceed()
					}
				},
				{
					key: 'cancel',
					text: 'Tiếp tục chỉnh sửa',
					className: 'text-zinc-400'
				}
			],
			afterClose: () => {
				blocker.reset()
			}
		})
	}, [blocker.state])

	useEffect(() => {
		if (monaco === null) return
		beforeEditorMount(monaco)
	}, [monaco])

	// Đặt key hình ảnh mặc định là hình ảnh đầu tiên khi danh sách thay đổi.
	useEffect(() => {
		const hasDefaultPhoto: boolean = some(images, { key: defaultPhotoKey })
		if (hasDefaultPhoto) return
		const photoKey = images.length > 0 ? images[0].key : ''
		if (typeof photoKey !== 'string') return
		setDefaultPhotoKey(photoKey)
	}, [images])

	useEffect(() => {
		if (!getNoteEditApi.data) return
		setNoteEdit(getNoteEditApi.data)
	}, [getNoteEditApi.data])

	useEffect(() => {
		if (!saveApi.data) return
		setNoteEdit(saveApi.data)
	}, [saveApi.data])

	useEffect(() => {
		if (editingNote.sha && !getNoteEditApi.data) return
		setTitle(noteEdit.isTitled ? noteEdit.title : '')
		setContent(noteEdit.content)
		setImages(noteEdit.photos as ImageUploadItem[])
		setDefaultPhotoKey(noteEdit.defaultPhotoKey)
		usedPhotoKeys.current = noteEdit.photos.map((photo) => photo.key)
	}, [noteEdit])

	useLayoutEffect(() => {
		setEditingNote(editingNote)
		loadYearApi.run(editingNote.year)
	}, [editingNote])

	useEffect(() => {
		getNoteEditApi.run(editingNote)
		return () => {
			getNoteEditApi.cancel()
		}
	}, [isYearStatusLoaded])

	useEffect(() => {
		return () => {
			editorDisposer.current?.dispose()
			useAppStore.setState({ monaco: null })
			closePreviewImage()
			// setEditingNote(null)
		}
	}, [])

	return (
		<div className="flex flex-1 flex-col">
			<NavBar
				onBack={() => navigate(-1)}
				back={isMd ? 'Trở về' : ''}
				right={
					<div className="flex items-center justify-end gap-4">
						<EntitiesManagerButton />
						<QuickSettingsButton />
					</div>
				}
			>
				<div className="font-semibold xs:text-base">
					{upperFirst(
						editingNote.time.format(isMd ? 'dddd, D MMMM, YYYY' : 'dd, DD-MM-YYYY')
					)}
					{isMd && (
						<span className="ml-2 text-zinc-500">
							<>
								({editingNote.lunar.day} tháng {editingNote.lunar.month} âm lịch)
							</>
						</span>
					)}
				</div>
			</NavBar>

			<div className="min-h-0 flex-1">
				{isLoading && (
					<div className="flex h-full flex-col p-4">
						<Skeleton.Title />
						<Skeleton.Paragraph lineCount={5} />
						<br />
						<Skeleton.Paragraph className="flex-1" lineCount={3} />
						<Skeleton.Title className="h-12" />
						<Skeleton.Title />
					</div>
				)}

				{!isLoading && (
					<div className="flex h-full flex-col">
						<div className="p-4 md:px-[4.75rem]">
							<Input
								className="font-semibold [&>input]:text-[#6a9955] [&>input]:placeholder:text-[#6a7a91]"
								autoComplete="off"
								placeholder={noteEdit.title}
								value={title}
								onChange={setTitle}
							/>
						</div>

						<Divider className="m-0" />

						<div className="min-h-0 flex-1">
							{isMd ? (
								<Editor
									theme={isDarkMode ? 'diori-dark' : 'vs'}
									language="diori"
									options={editorOptions}
									beforeMount={beforeEditorMount}
									onMount={handleEditorMount}
									value={content}
									onChange={(value) => setContent(value ?? '')}
								/>
							) : (
								<TextArea
									className="size-full resize-none bg-zinc-900 outline-0 [&>textarea]:px-4"
									style={{ fontSize }}
									value={content}
									onChange={setContent}
								/>
							)}
						</div>

						<Divider className="m-0 md:px-4" />

						<div className="flex items-center justify-between p-4 pb-0">
							<ImageUploader
								accept="image/jpeg, image/webp, image/png"
								maxCount={maxImagesCount}
								multiple
								preview={false}
								beforeUpload={filterValidImageFile}
								upload={makeImageFromFile}
								value={images}
								onChange={setImages}
								renderItem={(imageNode, image) => (
									<Popover.Menu
										key={image.key}
										mode="dark"
										trigger="click"
										actions={[
											{
												key: 'key',
												text: image.key,
												icon: <InformationCircleOutline />
											},
											{
												key: 'preview',
												text: 'Xem ảnh',
												icon: <EyeOutline />,
												onClick: () => {
													showPreviewImage(image)
												}
											},
											{
												key: 'setDefault',
												text: 'Đặt làm ảnh mặc định',
												icon: <PictureOutline />,
												disabled: image.key === defaultPhotoKey,
												onClick: () => {
													setDefaultPhotoKey(image.key as string)
												}
											},
											{
												key: 'remove',
												text: 'Xóa bỏ',
												icon: <DeleteOutline />,
												onClick: () => removeImage(image)
											}
										]}
									>
										<div
											className="image-contrast cursor-pointer"
											title="Nhấn để mở menu. Nhấn đúp để xem ảnh"
											onDoubleClick={() => showPreviewImage(image)}
										>
											{imageNode}
										</div>
									</Popover.Menu>
								)}
							/>

							<div className="flex items-center gap-3">
								{removedImages.map((photo) => (
									<img
										key={photo.key}
										className="h-20 w-20 cursor-pointer rounded object-cover opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
										src={photo.thumbnailUrl}
										alt="Ảnh sẽ bị xóa"
										title="Ảnh sẽ bị xóa bỏ khi lưu. Nhấn để khôi phục lại"
										onClick={() => restoreRemovedPhoto(photo)}
									/>
								))}
							</div>
						</div>

						<div className="flex items-center gap-4 p-4 xs:flex-col xs:items-start">
							<div className="flex gap-3">
								<Button
									color={currentErrorMessage === undefined ? 'primary' : 'danger'}
									disabled={!canSave}
									loading={saveApi.loading}
									loadingText="Đang lưu"
									onClick={handleSave}
								>
									Lưu
								</Button>

								<Button onClick={() => history.back()}>Trở về</Button>
							</div>

							{currentErrorMessage !== undefined && (
								<div className="text-rose-500">{currentErrorMessage}</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
