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
	TextArea
} from 'antd-mobile'
import { DeleteOutline, EyeOutline, InformationCircleOutline, PictureOutline } from 'antd-mobile-icons'
import { differenceBy, every, findIndex, reject, some, upperFirst } from 'lodash'
import { nanoid } from 'nanoid'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { Page } from '../../components/Page/Page'
import { QuickSettingsButton } from '../../components/QuickSettingsButton/QuickSettingsButton'
import { NoteEdit, Photo } from '../../store/slices/editingSlice'
import { useStore } from '../../store/useStore'
import { useGetNoteEdit } from './useGetNoteEdit'
import { useSave } from './useSave'
import { makeThumbnailUrl } from '../../utils/makeThumbnailUrl'

export function EditPage() {
	const editingNote = useStore((state) => state.editingNote)!

	if (!editingNote) return

	const store = useStore()
	const [form] = Form.useForm()
	const getNoteEdit = useGetNoteEdit()
	const save = useSave()
	const title = Form.useWatch('title', form)
	const content = Form.useWatch('content', form)
	const [images, setImages] = useState<ImageUploadItem[]>([])
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
		if (getNoteEdit.isMutating) return false
		if (content === undefined || title === undefined) return false

		if (content !== noteEdit.content) return true
		if (noteEdit.isTitled ? title !== noteEdit.title : title) return true
		if (addedImages.length || removedImages.length) return true
		if (defaultPhotoKey !== noteEdit.defaultPhotoKey) return true

		return false
	}, [getNoteEdit.isMutating, title, content, addedImages, removedImages, defaultPhotoKey, noteEdit])

	const blocker = useBlocker(unsaved)

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
		setImages([...images, image])
	}

	const handleSave = () => {
		save.trigger([title, content, images, addedImages, removedImages, defaultPhotoKey, noteEdit])
	}

	useEffect(() => {
		if (blocker.state !== 'blocked') return
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
						store.setEditingNote(null)
						blocker.proceed()
					}
				},
				{
					key: 'cancel',
					text: 'Đóng'
				}
			],
			onClose: () => {
				blocker.reset()
			}
		})
	}, [blocker.state])

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
			content
		})
		const newImages = photos.map((photo) => ({ ...photo }) as ImageUploadItem)
		setImages(newImages)
		setDefaultPhotoKey(defaultPhotoKey)
	}, [noteEdit])

	useLayoutEffect(() => {
		getNoteEdit.trigger(editingNote)
	}, [])

	return (
		<Page>
			<div className="flex flex-col h-full">
				<NavBar onBack={() => history.back()} right={<QuickSettingsButton />}>
					{upperFirst(editingNote.time.format('dddd, DD MMMM, YYYY'))}
				</NavBar>

				<div className="flex-1">
					{getNoteEdit.isMutating && (
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

					{!getNoteEdit.isMutating && (
						<Form className="h-full" form={form} onFinish={handleSave}>
							<Form.Item
								label="Tiêu đề"
								name="title"
								rules={[
									{
										type: 'string',
										max: 65,
										whitespace: true
									}
								]}
							>
								<Input
									placeholder={noteEdit && noteEdit.title && !noteEdit.isTitled ? noteEdit.title : ''}
								/>
							</Form.Item>

							<Form.Item
								className="flex-1"
								label="Nội dung"
								name="content"
								rules={[
									{
										type: 'string',
										max: 10000,
										whitespace: true
									}
								]}
							>
								<TextArea showCount />
							</Form.Item>

							<Form.Item
								extra={
									<div className="flex items-center">
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
													onClick: () => setImages(reject(images, { key: image.key }))
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
									<Button type="submit" color="primary" disabled={!unsaved}>
										Lưu
									</Button>
									<Button>Trở về</Button>
								</Space>
							</Form.Item>
						</Form>
					)}
				</div>
			</div>
		</Page>
	)
}
