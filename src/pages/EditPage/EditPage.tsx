import { Editor } from '@monaco-editor/react'
import { useUpdateEffect } from 'ahooks'
import {
	Button,
	Form,
	ImageUploadItem,
	ImageUploader,
	ImageViewer,
	Input,
	Modal,
	NavBar,
	Popover,
	Skeleton,
	Space,
	Toast
} from 'antd-mobile'
import { DeleteOutline, EyeOutline, InformationCircleOutline, PictureOutline } from 'antd-mobile-icons'
import clsx from 'clsx'
import { differenceBy, findIndex, reject, some, upperFirst } from 'lodash'
import * as Monaco from 'monaco-editor'
import { nanoid } from 'nanoid'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { Page } from '../../components/Page/Page'
import { QuickSettingsButton } from '../../components/QuickSettingsButton/QuickSettingsButton'
import { Note } from '../../store/slices/diarySlice'
import { NoteEdit, Photo } from '../../store/slices/editingSlice'
import { useStore } from '../../store/useStore'
import { formValidateMessages } from '../../utils/formValidateMessages'
import { makeThumbnailUrl } from '../../utils/makeThumbnailUrl'
import styles from './EditPage.module.scss'
import { useGetNoteEdit } from './useGetNoteEdit'
import { useSave } from './useSave'

export function EditPage() {
	const editingNote = useStore((state) => state.editingNote)

	if (!editingNote) return

	const store = useStore()
	const [form] = Form.useForm()
	const getNoteEdit = useGetNoteEdit()
	const save = useSave()
	const title = Form.useWatch<string>('title', form) ?? ''
	const content = Form.useWatch<string>('content', form) ?? ''
	const images = Form.useWatch<ImageUploadItem[]>('images', form) ?? []
	const [maxImagesCount] = useState(4)
	const [defaultPhotoKey, setDefaultPhotoKey] = useState('')

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

	const blocker = useBlocker(unsaved || save.loading)

	const canSave = useMemo<boolean>(() => {
		if (save.loading) return false
		if (!unsaved) return false

		return true
	}, [save.loading, unsaved])

	const beforeEditorMount = (monaco: typeof Monaco) => {
		monaco.languages.register({ id: 'diori' })

		monaco.languages.setMonarchTokensProvider('diori', {
			tokenizer: {
				root: [
					{
						regex: /".*?"/,
						action: 'green'
					},
					{
						regex: /\(.*?\)/,
						action: 'gray'
					},
					{
						regex: /([01]\d|2[0-3]):[0-5]\d|24:00|\d+h([0-5]\d)?|((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[012]))|[12]\d{3}/,
						action: 'red'
					},
					{
						regex: /\d+(tr|[kpt%])|\d+/,
						action: 'orange'
					},
					{
						regex: /Chi|Khương|Quyền|Kiên|Hải|Khải|Thắng|Tuyết|Hoàng/,
						action: 'blue'
					},
					{
						regex: /ao cá Bác Hồ|trại Chiêu|Golden Mark|ĐHCN|zalo/,
						action: 'purple'
					},
					{
						regex: /[\p{L}\d]+/
					}
				]
			},
			unicode: true
		})

		monaco.languages.setLanguageConfiguration('diori', {
			autoClosingPairs: [
				{ open: '(', close: ')' },
				{ open: '[', close: ']' },
				{ open: '{', close: '}' },
				{ open: '"', close: '"' }
			]
		})

		monaco.editor.defineTheme('diori-dark', {
			base: 'vs-dark',
			inherit: true,
			colors: {
				'editor.background': '#1a1a1a',
				'editor.foreground': '#e6e6e6',
				'editor.findMatchBorder': '#ffcb6b',
				'editor.findMatchHighlightBackground': '#ffcb6b66'
			},
			rules: [
				{
					token: 'green',
					foreground: '#c3e88d',
					fontStyle: 'italic'
				},
				{
					token: 'gray',
					foreground: '#697098',
					fontStyle: 'italic'
				},
				{
					token: 'red',
					foreground: '#ff5874',
					fontStyle: 'italic'
				},
				{
					token: 'orange',
					foreground: '#f78c6c',
					fontStyle: 'italic'
				},
				{
					token: 'blue',
					foreground: '#7986e7',
					fontStyle: 'italic'
				},
				{
					token: 'purple',
					foreground: '#c792ea',
					fontStyle: 'italic'
				}
			]
		})
	}

	const handleEditorMount = (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
		const model = editor.getModel()
		if (!model) return

		const { CtrlCmd, Shift, Alt } = monaco.KeyMod
		const { KeyCode } = monaco

		model.setEOL(monaco.editor.EndOfLineSequence.LF)

		editor.addCommand(CtrlCmd | KeyCode.KeyS, () => {
			form.submit()
		})
	}

	const localImageUpload = async (file: File): Promise<ImageUploadItem> => {
		const url = URL.createObjectURL(file)
		const thumbnailUrl = await makeThumbnailUrl(url)
		return {
			key: editingNote.time.date() + nanoid(6),
			thumbnailUrl,
			url
		}
	}

	const showPreviewImage = (defaultImage: ImageUploadItem) => {
		const defaultIndex = findIndex(images, { key: defaultImage.key })
		ImageViewer.Multi.show({
			images: images.map((image) => image.url ?? image.thumbnailUrl),
			defaultIndex
		})
	}

	const handleRestorePhoto = (photo: Photo) => {
		if (images.length >= maxImagesCount) return
		const image = { ...photo } as ImageUploadItem
		form.setFieldValue('images', [...images, image])
	}

	const handleSave = () => {
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
		const note: Note = store.getNote(editingNote.time) ?? store.makeNote(editingNote.time)
		store.setEditingNote(note)
	}, [store.notes[editingNote.date]])

	useEffect(() => {
		if (!save.data) return
		setNoteEdit(save.data)
	}, [save.data])

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
	}, [noteEdit])

	useLayoutEffect(() => {
		getNoteEdit.run(editingNote)
	}, [])

	useEffect(() => {
		return () => {
			// store.setEditingNote(null)
		}
	}, [])

	return (
		<Page>
			<div className="flex flex-col h-full">
				<NavBar onBack={() => history.back()} back="Trở về" right={<QuickSettingsButton />}>
					{upperFirst(editingNote.time.format('dddd, D MMMM, YYYY'))}
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
									placeholder={noteEdit && noteEdit.title && !noteEdit.isTitled ? noteEdit.title : ''}
								/>
							</Form.Item>

							<Form.Item
								className={clsx('flex-1 min-h-0', styles.formItemNoPadding)}
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
										wordWrap: 'on',
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
											renderCharacters: false
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
													onClick: () => showPreviewImage(image)
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
													onClick: () =>
														form.setFieldValue('images', reject(images, { key: image.key }))
												}
											]}
										>
											<div onDoubleClick={() => showPreviewImage(image)}>{imageNode}</div>
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
