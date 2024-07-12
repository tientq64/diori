/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { Fancybox } from '@fancyapps/ui'
import { Editor } from '@monaco-editor/react'
import { useUpdateEffect } from 'ahooks'
import {
	Button,
	Form,
	ImageUploadItem,
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
import { differenceBy, filter, findIndex, reject, some, upperFirst } from 'lodash'
import * as Monaco from 'monaco-editor'
import { nanoid } from 'nanoid'
import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useBlocker, useLocation } from 'react-router-dom'
import { EntitiesManagerDropdown } from '../../components/EntitiesManagerDropdown/EntitiesManagerDropdown'
import { Page } from '../../components/Page/Page'
import { QuickSettingsDropdown } from '../../components/QuickSettingsDropdown/QuickSettingsDropdown'
import { useGetNoteEdit } from '../../hooks/useGetNoteEdit'
import { usePhotosLoader } from '../../hooks/usePhotosLoader'
import { useSave } from '../../hooks/useSave'
import { Note } from '../../store/slices/diarySlice'
import { NoteEdit, Photo } from '../../store/slices/editingSlice'
import { Entity, EntityTypes } from '../../store/slices/settingsSlice'
import { useStore } from '../../store/useStore'
import { formValidateMessages } from '../../utils/formValidateMessages'
import { makeThumbnailUrl } from '../../utils/makeThumbnailUrl'
import { setupEditor } from './setupEditor'

import '@fancyapps/ui/dist/fancybox/fancybox.css'
import spinnerImage from '../../assets/images/spinner.svg'

export function EditPage(): ReactNode {
	const editingNote = useStore((state) => state.editingNote)

	if (!editingNote) return

	const store = useStore()
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
	const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor>()
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
		return filter(store.entities, { type: EntityTypes.PERSON })
	}, [store.entities])

	const properNouns = useMemo<Entity[]>(() => {
		return filter(store.entities, { type: EntityTypes.PROPER_NOUN })
	}, [store.entities])

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

	const blocker = useBlocker(unsaved || save.loading)

	const canSave = useMemo<boolean>(() => {
		if (save.loading) return false
		if (!unsaved) return false

		return true
	}, [save.loading, unsaved])

	const beforeEditorMount = (monaco: typeof Monaco): void => {
		monacoRef.current ??= monaco
		editorDisposer.current?.dispose()
		editorDisposer.current = setupEditor(monaco, {
			entities: store.entities,
			persons,
			properNouns
		})
	}

	const handleEditorMount = (
		editor: Monaco.editor.IStandaloneCodeEditor,
		monaco: typeof Monaco
	): void => {
		setEditor(editor)

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

	const localImageUpload = async (file: File): Promise<ImageUploadItem> => {
		const url = URL.createObjectURL(file)
		const thumbnailUrl = await makeThumbnailUrl(url)
		let key: string
		do {
			key = nanoid(6)
		} while (usedPhotoKeys.current.includes(key))
		usedPhotoKeys.current.push(key)
		return { key, thumbnailUrl, url }
	}

	const showPreviewImage = (defaultImage: ImageUploadItem): void => {
		Fancybox.show(
			images.map((image) => ({
				src: image.url || spinnerImage,
				thumbSrc: image.thumbnailUrl,
				id: `fancybox-image-${image.key}`
			})),
			{
				startIndex: findIndex(images, { key: defaultImage.key }),
				on: {
					'Carousel.change': (...args) => {
						console.log(args)
					}
				}
			}
		)
		// const defaultImageIndex: number = findIndex(images, { key: defaultImage.key })
		// ImageViewer.Multi.show({
		// 	images: images.map((image) => image.url ?? image.thumbnailUrl),
		// 	defaultIndex: defaultImageIndex,
		// 	onIndexChange: handlePreviewImageIndexChange
		// })
		// handlePreviewImageIndexChange(defaultImageIndex)
	}

	const handlePreviewImageIndexChange = (index: number): void => {
		const image: ImageUploadItem = images[index]
		photosLoader.run(editingNote.time, image.key as string)
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
			Modal.show({
				title: 'Dữ liệu chưa được lưu',
				content: 'Dữ liệu chưa được lưu sẽ bị mất, bạn vẫn muốn trở về?',
				showCloseButton: true,
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
						text: 'Đóng'
					}
				],
				afterClose: () => {
					blocker.reset()
				}
			})
		}
	}, [blocker.state])

	useUpdateEffect(() => {
		const newEditingNote: Note =
			store.getNote(editingNote.time) ?? store.makeNote(editingNote.time)
		store.setEditingNote(newEditingNote)
	}, [store.notes[editingNote.date]])

	useEffect(() => {
		if (!monacoRef.current) return
		beforeEditorMount(monacoRef.current)
	}, [store.entities])

	useEffect(() => {
		if (!editor) return
		editor.updateOptions({ fontSize: store.fontSize })
	}, [store.fontSize, editor])

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
			// store.setEditingNote(null)
			editorDisposer.current?.dispose()
		}
	}, [])

	return (
		<Page>
			<div className="flex flex-col h-full">
				<NavBar
					onBack={() => history.back()}
					back={store.isMd ? 'Trở về' : ''}
					right={
						<div className="flex justify-end items-center gap-4">
							<EntitiesManagerDropdown />
							<QuickSettingsDropdown />
						</div>
					}
				>
					{upperFirst(
						editingNote.time.format(store.isMd ? 'dddd, D MMMM, YYYY' : 'DD-MM-YYYY')
					)}
				</NavBar>

				<div className="flex-1 min-h-0">
					{getNoteEdit.loading && (
						<div className="flex flex-col h-full p-4">
							<Skeleton.Title />
							<br />
							<br />
							<Skeleton.Paragraph lineCount={5} />
							<br />
							<Skeleton.Paragraph className="flex-1" lineCount={3} />
							<Skeleton.Title className="h-12" />
							<Skeleton.Title />
						</div>
					)}

					{!getNoteEdit.loading && (
						<Form
							className="h-full"
							form={form}
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
								<Editor
									theme={store.isDarkMode ? 'diori-dark' : 'vs'}
									language="diori"
									options={{
										fontFamily: store.fontFamily,
										fontSize: 16,
										wordWrap: store.isMd ? 'wordWrapColumn' : 'on',
										wordWrapColumn: 160,
										wrappingStrategy: 'advanced',
										lineNumbers: 'off',
										lineDecorationsWidth: 0,
										insertSpaces: false,
										smoothScrolling: true,
										automaticLayout: true,
										renderLineHighlightOnlyWhenFocus: true,
										padding: {
											top: 12
										},
										minimap: {
											renderCharacters: false,
											enabled: store.isMd
										},
										stickyScroll: {
											enabled: false
										}
									}}
									defaultValue={content}
									beforeMount={beforeEditorMount}
									onMount={handleEditorMount}
								/>
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
											<div onDoubleClick={() => showPreviewImage(image)}>
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
