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
import {
	DeleteOutline,
	EyeOutline,
	InformationCircleOutline,
	PictureOutline
} from 'antd-mobile-icons'
import { differenceBy, findIndex, range, reject, some, uniq, upperFirst } from 'lodash'
import * as Monaco from 'monaco-editor'
import { nanoid } from 'nanoid'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { Page } from '../../components/Page/Page'
import { PersonsManagerDropdown } from '../../components/PersonsManagerDropdown/PersonsManagerDropdown'
import { QuickSettingsButton } from '../../components/QuickSettingsButton/QuickSettingsButton'
import { useGetNoteEdit } from '../../hooks/useGetNoteEdit'
import { useSave } from '../../hooks/useSave'
import { Note } from '../../store/slices/diarySlice'
import { NoteEdit, Photo } from '../../store/slices/editingSlice'
import { useStore } from '../../store/useStore'
import { formValidateMessages } from '../../utils/formValidateMessages'
import { makeThumbnailUrl } from '../../utils/makeThumbnailUrl'
import { ProperNounsManagerDropdown } from '../../components/ProperNounsManagerDropdown/ProperNounsManagerDropdown'

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
	const usedPhotoKeys = useRef<string[]>([])
	const monacoRef = useRef<typeof Monaco>()
	const monarchTokensDisposer = useRef<Monaco.IDisposable>()
	const languageConfigurationDisposer = useRef<Monaco.IDisposable>()
	const completionItemDisposer = useRef<Monaco.IDisposable>()

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
		monacoRef.current ??= monaco

		monaco.languages.register({ id: 'diori' })

		const personNames: string[] = uniq(
			store.properNoun
				.flatMap((person) => {
					const names = person.aliasNames
						.concat(person.name)
						.map((name) => name.replace(/ \(.*\)$/, ''))
					return names
				})
				.toSorted((nameA, nameB) => nameB.length - nameA.length)
		)
		const personNamesRegex: RegExp = personNames.length
			? RegExp(`(?:${personNames.join('|')})(?=[\\s.,:;!?)\\]}]|$)`)
			: /~^/

		const properNounNames: string[] = uniq(
			store.properNouns
				.flatMap((properNoun) => {
					const names = properNoun.aliasNames
						.concat(properNoun.name)
						.map((name) => name.replace(/ \(.*\)$/, ''))
					return names
				})
				.toSorted((nameA, nameB) => nameB.length - nameA.length)
		)
		const properNounsRegex: RegExp = properNounNames.length
			? RegExp(`(?:${properNounNames.join('|')})(?=[\\s.,:;!?)\\]}]|$)`)
			: /~^/

		monarchTokensDisposer.current?.dispose()
		monarchTokensDisposer.current = monaco.languages.setMonarchTokensProvider('diori', {
			tokenizer: {
				root: [
					{
						// Trích dẫn, lời nói.
						regex: /"/,
						action: { token: 'green-italic', next: '@quote' }
					},
					{
						// Chú thích.
						regex: /\(/,
						action: { token: 'gray', next: '@note' }
					},
					{
						// Chi tiết link.
						regex: /^(\[.+?\])(: *)([^"\n]+?)((?: *".+?")?)$/,
						action: ['gray', 'gray', 'aqua-italic', 'green-italic']
					},
					{
						// Link.
						regex: /(\[)(.+?)(\])(\[.+?\])/,
						action: ['aqua', 'aqua-italic', 'aqua', 'gray']
					},
					{
						// Giờ phút.
						regex: /(([01]\d|2[0-3]):[0-5]\d|24:00|\d+h([0-5]\d)?)(?=[\s.,:;!?)\]}]|$)/,
						action: 'red-italic'
					},
					{
						// Ngày tháng năm.
						regex: /((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[012])\/[12]\d{3})(?=[\s.,:;!?)\]}]|$)/,
						action: 'red-italic'
					},
					{
						// Ngày tháng, năm.
						regex: /(((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[012]))|[12]\d{3})(?=[\s.,:;!?)\]}]|$)/,
						action: 'red-italic'
					},
					{
						// Tỷ số.
						regex: /(\d+-\d+)(?=[\s.,:;!?)\]}]|$)/,
						action: 'orange-italic'
					},
					{
						// Đơn vị, số.
						regex: /(\d+(tr|[kpt%])|\d+)(?=[\s.,:;!?)\]}]|$)/,
						action: 'orange-italic'
					},
					{
						// Tên người.
						regex: personNamesRegex,
						action: 'blue-italic'
					},
					{
						// Tên riêng.
						regex: properNounsRegex,
						action: 'purple-italic'
					},
					{
						include: '@emotions'
					},
					{
						regex: /[\p{L}\d]+/
					}
				],
				note: [
					{
						include: '@emotions'
					},
					{
						regex: /\)/,
						action: { token: 'gray', next: '@pop' }
					},
					{
						regex: /\(/,
						action: { token: 'gray', next: '@push' }
					},
					{
						regex: /.+?/,
						action: { token: 'gray-italic' }
					}
				],
				quote: [
					{
						include: '@emotions'
					},
					{
						regex: /"/,
						action: { token: 'green-italic', next: '@pop' }
					},
					{
						regex: /.+?/,
						action: { token: 'green-italic' }
					}
				],
				emotions: [
					{
						regex: /:["']?[()]+|:["']?>|:[D3v]|[;=]\)+/,
						action: 'yellow'
					}
				]
			},
			unicode: true
		})

		languageConfigurationDisposer.current?.dispose()
		languageConfigurationDisposer.current = monaco.languages.setLanguageConfiguration('diori', {
			autoClosingPairs: [
				{ open: '(', close: ')' },
				{ open: '[', close: ']' },
				{ open: '{', close: '}' },
				{ open: '"', close: '"' }
			]
		})

		completionItemDisposer.current?.dispose()
		completionItemDisposer.current = monaco.languages.registerCompletionItemProvider('diori', {
			provideCompletionItems(model, position) {
				const wordPosition = model.getWordUntilPosition(position)
				const range = new monaco.Range(
					position.lineNumber,
					wordPosition.startColumn,
					position.lineNumber,
					wordPosition.endColumn
				)
				const suggestions = store.properNoun.map<Monaco.languages.CompletionItem>(
					(person) => {
						return {
							label: person.name,
							insertText: person.name,
							kind: Monaco.languages.CompletionItemKind.User,
							documentation: person.description,
							range
						}
					}
				)
				return { suggestions }
			}
		})

		monaco.languages.registerLinkProvider('diori', {
			provideLinks(model) {
				const value = model.getValue()
				let iterator

				const links: Record<string, string[]> = {}
				iterator = value.matchAll(/^\[(.+?)\]: *([^"\n]+?)(?: *"(.+?)")?$/gm)
				for (const item of iterator) {
					links[item[1]] = [item[1], item[2], item[3]]
				}

				const editorLinks: Monaco.languages.ILink[] = []
				iterator = value.matchAll(/\[.+?\]\[(.+?)\]/dg)
				for (const item of iterator) {
					const link = links[item[1]]
					if (!link) continue
					const [start, end] = item.indices![0]
					const startPosition = model.getPositionAt(start)
					const endPosition = model.getPositionAt(end - item[1].length - 2)
					const editorLink: Monaco.languages.ILink = {
						range: new monaco.Range(
							startPosition.lineNumber,
							startPosition.column,
							endPosition.lineNumber,
							endPosition.column
						),
						url: link[1],
						tooltip: (link[2] ? `${link[2]} \u2013 ` : '') + link[1]
					}
					editorLinks.push(editorLink)
				}
				return {
					links: editorLinks
				}
			}
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
					foreground: '#c3e88d'
				},
				{
					token: 'green-italic',
					foreground: '#c3e88d',
					fontStyle: 'italic'
				},
				{
					token: 'gray',
					foreground: '#697098'
				},
				{
					token: 'gray-italic',
					foreground: '#697098',
					fontStyle: 'italic'
				},
				{
					token: 'red',
					foreground: '#ff5874'
				},
				{
					token: 'red-italic',
					foreground: '#ff5874',
					fontStyle: 'italic'
				},
				{
					token: 'orange',
					foreground: '#f78c6c'
				},
				{
					token: 'orange-italic',
					foreground: '#f78c6c',
					fontStyle: 'italic'
				},
				{
					token: 'blue',
					foreground: '#7986e7'
				},
				{
					token: 'blue-italic',
					foreground: '#7986e7',
					fontStyle: 'italic'
				},
				{
					token: 'purple',
					foreground: '#c792ea'
				},
				{
					token: 'purple-italic',
					foreground: '#c792ea',
					fontStyle: 'italic'
				},
				{
					token: 'aqua',
					foreground: '#89ddff'
				},
				{
					token: 'aqua-italic',
					foreground: '#89ddff',
					fontStyle: 'italic'
				},
				{
					token: 'yellow',
					foreground: '#ffcb6b'
				},
				{
					token: 'yellow-italic',
					foreground: '#ffcb6b',
					fontStyle: 'italic'
				}
			]
		})
	}

	const handleEditorMount = (
		editor: Monaco.editor.IStandaloneCodeEditor,
		monaco: typeof Monaco
	) => {
		const model = editor.getModel()
		if (!model) return

		model.setEOL(monaco.editor.EndOfLineSequence.LF)

		const { CtrlCmd } = monaco.KeyMod
		const { KeyCode } = monaco

		editor.addCommand(CtrlCmd | KeyCode.KeyS, () => {
			form.submit()
		})
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
		const newEditingNote: Note =
			store.getNote(editingNote.time) ?? store.makeNote(editingNote.time)
		store.setEditingNote(newEditingNote)
	}, [store.notes[editingNote.date]])

	useEffect(() => {
		if (!monacoRef.current) return
		beforeEditorMount(monacoRef.current)
	}, [store.properNoun])

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
			monarchTokensDisposer.current?.dispose()
			completionItemDisposer.current?.dispose()
			languageConfigurationDisposer.current?.dispose()
		}
	}, [])

	return (
		<Page>
			<div className="flex flex-col h-full">
				<NavBar
					onBack={() => history.back()}
					back="Trở về"
					right={
						<div className="flex justify-end items-center gap-4">
							<PersonsManagerDropdown />
							<ProperNounsManagerDropdown />
							<QuickSettingsButton />
						</div>
					}
				>
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
