import Pica from 'pica'

export async function makeCompressImageBase64(blobUrl: string): Promise<string> {
	const image = new Image()
	await new Promise((resolve) => {
		image.onload = () => {
			resolve(null)
		}
		image.src = blobUrl
	})

	const canvas = document.createElement('canvas')
	canvas.width = image.naturalWidth
	canvas.height = image.naturalHeight

	const pica = new Pica()
	await pica.resize(image, canvas, {
		unsharpAmount: 100,
		unsharpRadius: 0.5,
		unsharpThreshold: 0
	})

	const dataUrl: string = canvas.toDataURL('image/webp', 0.8)
	const base64: string = dataUrl.replace('data:image/webp;base64,', '')
	return base64
}
