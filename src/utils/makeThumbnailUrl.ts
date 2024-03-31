import Pica from 'pica'

/**
 * Tạo hình thu nhỏ, dạng data URL, kích thước 80x80.
 */
export async function makeThumbnailUrl(
	/** Blob URL. */
	blobUrl: string
): Promise<string> {
	const image = new Image()
	await new Promise((resolve) => {
		image.onload = () => {
			resolve(null)
		}
		image.src = blobUrl
	})

	let sx = 0
	let sy = 0
	let sw = image.width
	let sh = image.height
	if (sw > sh) {
		sx = Math.floor((sw - sh) / 2)
		sw = sh
	} else if (sw < sh) {
		sy = Math.floor((sh - sw) / 2)
		sh = sw
	}
	const bitmap = await createImageBitmap(image, sx, sy, sw, sh)

	const canvas = document.createElement('canvas')
	canvas.width = 80
	canvas.height = 80

	const pica = new Pica()
	await pica.resize(bitmap, canvas, {
		unsharpAmount: 100,
		unsharpRadius: 0.5,
		unsharpThreshold: 0
	})

	return canvas.toDataURL('image/webp', 0.4)
}
