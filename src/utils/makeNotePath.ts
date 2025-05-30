import { ImageUploadItem } from 'antd-mobile'
import { Dayjs } from 'dayjs'
import { compressBase64 } from './compressBase64'
import { textToMinBase64 } from './textToMinBase64'

/**
 * Tạo và trả về đường dẫn GitHub cho file ngày nhật ký.
 *
 * Đường dẫn ví dụ: `days/2024/1005;xJDDonkgbMOgIHRpw6p1IMSR4buB;T.json`
 *
 * @param time Ngày của nhật ký.
 * @param title Tiêu đề nhật ký, được tạo tự động hoặc do người dùng viết.
 * @param isTitled Tiêu đề có phải do người dùng viết hay không.
 * @param defaultPhotoKey Id hình ảnh mặc định của nhật ký.
 * @param images Các hình ảnh của nhật ký.
 */
export function makeNotePath(
	time: Dayjs,
	title: string,
	isTitled: boolean,
	defaultPhotoKey: string,
	images: ImageUploadItem[]
): string {
	/**
	 * Ảnh mặc định.
	 */
	const defaultPhoto: ImageUploadItem | undefined = images.find((image) => {
		return image.key === defaultPhotoKey
	})

	/**
	 * Chuỗi base64 được nén của hình thu nhỏ của ảnh mặc định.
	 */
	const defaultPhotoThumbnailUrlMinBase64: string = defaultPhoto
		? compressBase64(
				defaultPhoto.thumbnailUrl!.replace('data:image/webp;base64,', '')
			)
		: ''

	/**
	 * Các phần của đường dẫn.
	 */
	const chunks: string[] = [
		time.format('MMDD'),
		textToMinBase64(title),
		isTitled ? 'T' : '',
		defaultPhotoThumbnailUrlMinBase64,
		defaultPhotoKey,
		images.length >= 2 ? String(images.length) : ''
	]

	const year: number = time.year()
	const filename: string = chunks.join(';').replace(/;+$/, '')

	return `days/${year}/${filename}.json`
}
