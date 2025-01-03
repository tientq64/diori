import { Fancybox } from '@fancyapps/ui'
import '@fancyapps/ui/dist/fancybox/fancybox.css'
import { slideType } from '@fancyapps/ui/types/Carousel/types'
import { Editor } from '@monaco-editor/react'
import { useUpdateEffect } from 'ahooks'
import {
	Button,
	Form,
	ImageUploader,
	Input,
	Modal,
	NavBar,
	Popover,
	Skeleton,
	Space,
	Toast
} from 'antd-mobile'
import {
	DeleteOutline,
	EyeOutline,
	InformationCircleOutline,
	PictureOutline
} from 'antd-mobile-icons'
import { differenceBy, find, findIndex, reject, some, upperFirst } from 'lodash'
import { nanoid } from 'nanoid'
import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Blocker, Navigate, useBlocker, useLocation } from 'react-router'
import spinnerImage from '../assets/images/spinner.svg'
import { EntitiesManagerButton } from '../components/EntitiesManagerButton'
import { Page } from '../components/Page'
import { QuickSettingsButton } from '../components/QuickSettingsButton'
import { useEditorOptions } from '../hooks/useEditorOptions'
import { useGetNoteEdit } from '../hooks/useGetNoteEdit'
import { usePhotosLoader } from '../hooks/usePhotosLoader'
import { useSave } from '../hooks/useSave'
import { Note } from '../store/slices/diarySlice'
import { NoteEdit, Photo } from '../store/slices/editingSlice'
import { useStore } from '../store/useStore'
import { CodeEditor, EditorOptions, Monaco } from '../types/monaco'
import { emptyArray } from '../utils/constants'
import { setupEditor } from '../utils/editor/setupEditor'
import { formValidateMessages } from '../utils/formValidateMessages'
import { makeThumbnailUrl } from '../utils/makeThumbnailUrl'

export interface ImageUploadItem {
	key?: string | number
	url: string
	thumbnailUrl?: string
	extra?: any
	loadUrlPromise?: Promise<string>
}

export function EditPage(): ReactNode {
	const editingNote = useStore((state) => state.editingNote)

	if (!editingNote) {
		return <Navigate to="/login" replace />
	}

	const entities = useStore((state) => state.entities)
	const notes = useStore((state) => state.notes)
	const isMd = useStore((state) => state.isMd)
	const isDarkMode = useStore((state) => state.isDarkMode)
	const fontSize = useStore((state) => state.fontSize)
	const monaco = useStore((state) => state.monaco)
	const getNote = useStore((state) => state.getNote)
	const makeNote = useStore((state) => state.makeNote)
	const setEditingNote = useStore((state) => state.setEditingNote)

	const location = useLocation()
	const getNoteEdit = useGetNoteEdit()
	const save = useSave()
	const [form] = Form.useForm()
	const title = Form.useWatch<string>('title', form) ?? ''
	const content = Form.useWatch<string>('content', form) ?? ''
	const images = Form.useWatch<ImageUploadItem[]>('images', form) ?? emptyArray
	const [maxImagesCount] = useState<number>(4)
	const [defaultPhotoKey, setDefaultPhotoKey] = useState<string>('')
	const usedPhotoKeys = useRef<string[]>([])
	const photosLoader = usePhotosLoader()
	const editorRef = useRef<CodeEditor | null>(null)
	const editorDisposer = useRef<Monaco.IDisposable>()
	const [previewImageVisible, setPreviewImageVisible] = useState<boolean>(false)

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

	const unsaved = useMemo<boolean>(() => {
		if (getNoteEdit.loading) return false
		if (content && content.trim() === '') return false
		if (title && title.trim() === '') return false

		if (content !== noteEdit.content) return true
		if (noteEdit.isTitled ? title !== noteEdit.title : title) return true
		if (addedImages.length || removedImages.length) return true
		if (defaultPhotoKey !== noteEdit.defaultPhotoKey) return true

		return false
	}, [getNoteEdit.loading, title, content, addedImages, removedImages, defaultPhotoKey, noteEdit])

	const blocker: Blocker = useBlocker(unsaved || save.loading)

	const canSave = useMemo<boolean>(() => {
		if (save.loading) return false
		if (!unsaved) return false
		if (previewImageVisible) return false

		return true
	}, [save.loading, unsaved, previewImageVisible])

	const beforeEditorMount = (monaco: typeof Monaco): void => {
		useStore.setState({ monaco })
		editorDisposer.current?.dispose()
		editorDisposer.current = setupEditor()
	}

	const handleEditorMount = (editor: CodeEditor, monaco: typeof Monaco): void => {
		editorRef.current = editor

		const model = editor.getModel()
		if (!model) return

		model.setEOL(monaco.editor.EndOfLineSequence.LF)

		// const { CtrlCmd } = monaco.KeyMod
		// const { KeyCode } = monaco

		// editor.addCommand(CtrlCmd | KeyCode.Period, (): void => {})

		if (location.state?.findText) {
			const matched = model
				.findMatches(location.state.findText, false, false, false, null, true)
				.at(0)
			if (matched) {
				editor.setSelection(matched.range)
				const action = editor.getAction('actions.find')
				if (action) {
					action.run()
					setTimeout(editor.setScrollTop.bind(editor), 10, 0)
				}
			}
		}
	}

	const filterValidImageFile = async (file: File): Promise<File | null> => {
		if (!/^image\/(jpeg|webp|png)$/.test(file.type)) {
			return null
		}
		return file
	}

	/**
	 * Hàm trả về đối tượng ảnh cần tải lên của component `ImageUploader`.
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
	 * Xem ảnh.
	 * @param image Ảnh cần xem.
	 */
	const showPreviewImage = (image: ImageUploadItem): void => {
		const startIndex: number = findIndex(images, { key: image.key })
		setPreviewImageVisible(true)

		const fancybox: Fancybox = new Fancybox(
			images.map((image2) => ({
				src: spinnerImage,
				thumbSrc: image2.thumbnailUrl,
				id: image2.key as string
			})),
			{
				startIndex,
				on: {
					'Carousel.selectSlide': async (_, __, slide: slideType): Promise<void> => {
						const image: ImageUploadItem | undefined = find(images, { key: slide.id })
						if (image === undefined) return
						const url: string | undefined = await loadImagePhotoUrl(image)
						if (url === undefined) return
						const imageEl = slide.imageEl as HTMLImageElement | undefined
						if (imageEl === undefined) return
						imageEl.src = url
					},
					close: (): void => {
						setPreviewImageVisible(false)
						fancybox.destroy()
					}
				}
			}
		)
	}

	/**
	 * Lấy data URL của ảnh.
	 * @param image Ảnh chuẩn bị tải lên hoặc ảnh đã tải lên rồi.
	 * @returns Data URL của ảnh.
	 */
	const loadImagePhotoUrl = async (image: ImageUploadItem): Promise<string | undefined> => {
		if (image.url) {
			return image.url
		}
		if (image.loadUrlPromise) {
			return image.loadUrlPromise
		}
		const loadUrlPromise: Promise<string> = photosLoader.runAsync(editingNote.time, image)
		const images2: ImageUploadItem[] = form.getFieldValue('images')
		const image2: ImageUploadItem = find(images2, { key: image.key })!
		image2.loadUrlPromise = loadUrlPromise
		form.setFieldValue('images', images2)
		const blobUrl: string = await loadUrlPromise
		const images3: ImageUploadItem[] = form.getFieldValue('images')
		const image3: ImageUploadItem | undefined = find(images3, { key: image.key })
		if (image3) {
			image3.url = blobUrl
			form.setFieldValue('images', images3)
			return blobUrl
		}
		return undefined
	}

	const handleRestorePhoto = (photo: Photo): void => {
		if (images.length >= maxImagesCount) return
		const image = { ...photo } as ImageUploadItem
		form.setFieldValue('images', [...images, image])
	}

	const handleSave = (): void => {
		if (!canSave) return
		save.run(title, content, images, addedImages, removedImages, defaultPhotoKey, noteEdit)
	}

	useHotkeys(
		'ctrl+s',
		() => {
			form.submit()
		},
		{
			preventDefault: true,
			enableOnFormTags: true,
			enabled: () => {
				return canSave
			}
		}
	)

	useEffect(() => {
		if (blocker.state !== 'blocked') return
		if (save.loading) {
			Toast.show('Không thể trở về trong khi đang lưu')
			return
		}
		Modal.show({
			title: 'Dữ liệu chưa được lưu',
			content: 'Dữ liệu chưa được lưu sẽ bị mất, bạn vẫn muốn trở về?',
			closeOnMaskClick: true,
			closeOnAction: true,
			actions: [
				{
					key: 'save',
					text: 'Lưu',
					primary: true,
					onClick: () => {
						form.submit()
					}
				},
				{
					key: 'back',
					text: 'Trở về',
					danger: true,
					onClick: () => {
						blocker.proceed()
					}
				},
				{
					key: 'cancel',
					text: 'Đóng',
					className: 'text-zinc-400'
				}
			],
			afterClose: () => {
				blocker.reset()
			}
		})
	}, [blocker.state])

	useUpdateEffect(() => {
		const newEditingNote: Note = getNote(editingNote.time) ?? makeNote(editingNote.time)
		setEditingNote(newEditingNote)
	}, [notes[editingNote.date]])

	useEffect(() => {
		if (monaco === null) return
		beforeEditorMount(monaco)
	}, [entities])

	useEffect(() => {
		if (!save.data) return
		setNoteEdit(save.data)
	}, [save.data])

	useEffect(() => {
		if (images.length <= 4) return
		form.setFieldValue('images', images.slice(0, 4))
	}, [images.length])

	useEffect(() => {
		const hasDefaultPhoto = some(images, { key: defaultPhotoKey })
		if (hasDefaultPhoto) return
		const photoKey = images.length > 0 ? images[0].key : ''
		setDefaultPhotoKey(photoKey as string)
	}, [images])

	useEffect(() => {
		if (!getNoteEdit.data) return
		setNoteEdit(getNoteEdit.data)
	}, [getNoteEdit.data])

	useEffect(() => {
		if (editingNote.sha && !getNoteEdit.data) return
		const { title, isTitled, content, photos, defaultPhotoKey } = noteEdit
		form.setFieldsValue({
			title: isTitled ? title : '',
			content,
			images: structuredClone(photos)
		})
		setDefaultPhotoKey(defaultPhotoKey)
		usedPhotoKeys.current = photos.map((photo) => photo.key)
	}, [noteEdit])

	useLayoutEffect(() => {
		getNoteEdit.run(editingNote)
	}, [])

	useEffect(() => {
		return () => {
			editorDisposer.current?.dispose()
			useStore.setState({ monaco: null })
			// setEditingNote(null)
		}
	}, [])

	return (
		<Page>
			<div className="flex flex-col h-full">
				<NavBar
					onBack={() => history.back()}
					back={isMd ? 'Trở về' : ''}
					right={
						<div className="flex justify-end items-center gap-4">
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
							<span className="text-zinc-500 ml-2">
								<>
									({editingNote.lunar.day} tháng {editingNote.lunar.month} âm
									lịch)
								</>
							</span>
						)}
					</div>
				</NavBar>

				<div className="flex-1 min-h-0">
					{getNoteEdit.loading && (
						<div className="flex flex-col h-full p-4">
							<Skeleton.Title />
							<Skeleton.Paragraph lineCount={5} />
							<br />
							<Skeleton.Paragraph className="flex-1" lineCount={3} />
							<Skeleton.Title className="h-12" />
							<Skeleton.Title />
						</div>
					)}

					{!getNoteEdit.loading && (
						<Form
							className="h-full adm-form-card-m0"
							form={form}
							mode="card"
							validateMessages={formValidateMessages}
							onFinish={handleSave}
						>
							<Form.Item
								name="title"
								layout="horizontal"
								rules={[
									{
										max: 60,
										whitespace: true
									}
								]}
							>
								<Input
									className="font-semibold [&>input]:text-[#c3e88d] [&>input]:placeholder:text-[#6a7a91]"
									autoComplete="off"
									placeholder={
										noteEdit && noteEdit.title && !noteEdit.isTitled
											? noteEdit.title
											: ''
									}
								/>
							</Form.Item>

							<Form.Item
								className="flex-1 min-h-0 adm-list-item-no-padding"
								name="content"
								rules={[
									{
										max: 10000,
										whitespace: true
									}
								]}
								messageVariables={{
									label: 'Nội dung'
								}}
							>
								{isMd ? (
									<Editor
										theme={isDarkMode ? 'diori-dark' : 'vs'}
										language="diori"
										options={editorOptions}
										defaultValue={content}
										beforeMount={beforeEditorMount}
										onMount={handleEditorMount}
									/>
								) : (
									<textarea
										className="size-full px-4 py-2 resize-none bg-zinc-900 outline-0"
										style={{ fontSize }}
									/>
								)}
							</Form.Item>

							<Form.Item
								name="images"
								extra={
									<div className="flex items-center gap-3">
										{removedImages.map((photo) => (
											<img
												key={photo.key}
												className="w-20 h-20 rounded object-cover opacity-50 grayscale hover:opacity-100 hover:grayscale-0 cursor-pointer"
												src={photo.thumbnailUrl}
												alt="Ảnh sẽ bị xóa"
												onClick={() => handleRestorePhoto(photo)}
											/>
										))}
									</div>
								}
							>
								<ImageUploader
									accept="image/jpeg, image/webp, image/png"
									maxCount={maxImagesCount}
									multiple
									preview={false}
									beforeUpload={filterValidImageFile}
									upload={makeImageFromFile}
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
													onClick: () => {
														form.setFieldValue(
															'images',
															reject(images, { key: image.key })
														)
													}
												}
											]}
										>
											<div
												className="image-contrast"
												onDoubleClick={() => showPreviewImage(image)}
											>
												{imageNode}
											</div>
										</Popover.Menu>
									)}
								/>
							</Form.Item>

							<Form.Item>
								<Space>
									<Button
										type="submit"
										color="primary"
										disabled={!canSave}
										loading={save.loading}
										loadingText="Đang lưu"
									>
										Lưu
									</Button>

									<Button onClick={() => history.back()}>Trở về</Button>
								</Space>
							</Form.Item>
						</Form>
					)}
				</div>
			</div>
		</Page>
	)
}
