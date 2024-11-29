/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { Fancybox } from '@fancyapps/ui'
import '@fancyapps/ui/dist/fancybox/fancybox.css'
import { slideType } from '@fancyapps/ui/types/Carousel/types'
import { Editor } from '@monaco-editor/react'
import { useUpdateEffect } from 'ahooks'
import {
	Button,
	Dialog,
	Form,
	ImageUploader,
	Input,
	NavBar,
	Popover,
	Skeleton,
	Space,
	TextArea,
	Toast
} from 'antd-mobile'
import {
	DeleteOutline,
	EyeOutline,
	InformationCircleOutline,
	PictureOutline
} from 'antd-mobile-icons'
import { differenceBy, filter, find, findIndex, reject, some, upperFirst } from 'lodash'
import * as Monaco from 'monaco-editor'
import { nanoid } from 'nanoid'
import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Blocker, useBlocker, useLocation } from 'react-router-dom'
import spinnerImage from '../assets/images/spinner.svg'
import { EntitiesManagerDropdown } from '../components/EntitiesManagerDropdown'
import { Page } from '../components/Page'
import { QuickSettingsDropdown } from '../components/QuickSettingsDropdown'
import { useGetNoteEdit } from '../hooks/useGetNoteEdit'
import { usePhotosLoader } from '../hooks/usePhotosLoader'
import { useSave } from '../hooks/useSave'
import { Note } from '../store/slices/diarySlice'
import { NoteEdit, Photo } from '../store/slices/editingSlice'
import { Entity, EntityTypes } from '../store/slices/settingsSlice'
import { useStore } from '../store/useStore'
import { formValidateMessages } from '../utils/formValidateMessages'
import { makeThumbnailUrl } from '../utils/makeThumbnailUrl'
import { setupEditor } from '../utils/setupEditor'

export type ImageUploadItem = {
	key?: string | number
	url: string
	thumbnailUrl?: string
	extra?: any
	loadUrlPromise?: Promise<string>
}

export function EditPage(): ReactNode {
	const editingNote = useStore((state) => state.editingNote)

	if (!editingNote) return

	const entities = useStore((state) => state.entities)
	const notes = useStore((state) => state.notes)
	const isMd = useStore((state) => state.isMd)
	const isDarkMode = useStore((state) => state.isDarkMode)
	const fontFamily = useStore((state) => state.fontFamily)
	const fontSize = useStore((state) => state.fontSize)
	const getNote = useStore((state) => state.getNote)
	const makeNote = useStore((state) => state.makeNote)
	const setEditingNote = useStore((state) => state.setEditingNote)

	const location = useLocation()
	const getNoteEdit = useGetNoteEdit()
	const save = useSave()
	const [form] = Form.useForm()
	const title = Form.useWatch<string>('title', form) ?? ''
	const content = Form.useWatch<string>('content', form) ?? ''
	const images = Form.useWatch<ImageUploadItem[]>('images', form) ?? []
	const [maxImagesCount] = useState<number>(4)
	const [defaultPhotoKey, setDefaultPhotoKey] = useState<string>('')
	const usedPhotoKeys = useRef<string[]>([])
	const photosLoader = usePhotosLoader()
	const monacoRef = useRef<typeof Monaco>()
	const editorDisposer = useRef<Monaco.IDisposable>()

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

	const persons = useMemo<Entity[]>(() => {
		return filter(entities, { type: EntityTypes.PERSON })
	}, [entities])

	const properNouns = useMemo<Entity[]>(() => {
		return filter(entities, { type: EntityTypes.PROPER_NOUN })
	}, [entities])

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

		return true
	}, [save.loading, unsaved])

	const editorOptions = useMemo<Monaco.editor.IStandaloneEditorConstructionOptions>(
		() => ({
			fontFamily: fontFamily,
			fontSize: fontSize,
			wordWrap: isMd ? 'bounded' : 'on',
			wordWrapColumn: 160,
			wrappingStrategy: 'advanced',
			lineNumbers: 'off',
			lineDecorationsWidth: 0,
			insertSpaces: false,
			smoothScrolling: true,
			automaticLayout: true,
			renderLineHighlightOnlyWhenFocus: true,
			rulers: isMd ? [164] : undefined,
			padding: {
				top: 12
			},
			minimap: {
				enabled: isMd,
				renderCharacters: false,
				maxColumn: 400
			},
			stickyScroll: {
				enabled: false
			}
		}),
		[fontFamily, fontSize, isMd]
	)

	const beforeEditorMount = (monaco: typeof Monaco): void => {
		monacoRef.current ??= monaco
		editorDisposer.current?.dispose()
		editorDisposer.current = setupEditor(monaco, {
			entities: entities,
			persons,
			properNouns
		})
	}

	const handleEditorMount = (
		editor: Monaco.editor.IStandaloneCodeEditor,
		monaco: typeof Monaco
	): void => {
		const model = editor.getModel()
		if (!model) return

		model.setEOL(monaco.editor.EndOfLineSequence.LF)

		const { CtrlCmd } = monaco.KeyMod
		const { KeyCode } = monaco

		editor.addCommand(CtrlCmd | KeyCode.KeyS, () => {
			form.submit()
		})

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

	const localImageBeforeUpload = async (file: File): Promise<File | null> => {
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
	const localImageUpload = async (file: File): Promise<ImageUploadItem> => {
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
						fancybox.destroy()
					}
				}
			}
		)
	}

	/**
	 * Lấy data URL của ảnh.
	 * @param image Ảnh cần tải, có thể là ảnh chuẩn bị tải lên hoặc ảnh đã tải lên rồi.
	 * @returns Data URL của ảnh.
	 */
	const loadImagePhotoUrl = async (image: ImageUploadItem): Promise<string | undefined> => {
		if (image.url) {
			return image.url
		} else if (image.loadUrlPromise) {
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

	useEffect(() => {
		if (blocker.state !== 'blocked') return
		if (save.loading) {
			Toast.show('Không thể trở về trong khi đang lưu')
		} else {
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
		}
	}, [blocker.state])

	useUpdateEffect(() => {
		const newEditingNote: Note = getNote(editingNote.time) ?? makeNote(editingNote.time)
		setEditingNote(newEditingNote)
	}, [notes[editingNote.date]])

	useEffect(() => {
		if (!monacoRef.current) return
		beforeEditorMount(monacoRef.current)
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
			images: photos.map((photo) => ({ ...photo }))
		})
		setDefaultPhotoKey(defaultPhotoKey)
		usedPhotoKeys.current = photos.map((photo) => photo.key)
	}, [noteEdit])

	useLayoutEffect(() => {
		getNoteEdit.run(editingNote)
	}, [])

	useEffect(() => {
		return () => {
			// setEditingNote(null)
			editorDisposer.current?.dispose()
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
							<EntitiesManagerDropdown />
							<QuickSettingsDropdown />
						</div>
					}
				>
					<div className="xs:text-base">
						{upperFirst(
							editingNote.time.format(isMd ? 'dddd, D MMMM, YYYY' : 'dd, DD-MM-YYYY')
						)}
						{isMd && (
							<span className="text-gray-500 ml-2">
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
									className="[&>input]:placeholder:text-gray-500"
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
									<TextArea
										className="px-4 py-3"
										style={{
											'--font-size': fontSize + 'px'
										}}
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
									beforeUpload={localImageBeforeUpload}
									upload={localImageUpload}
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
