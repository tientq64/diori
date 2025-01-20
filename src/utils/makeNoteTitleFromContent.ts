import { truncate } from 'lodash'

const linkReferenceLineRegex: RegExp = /^\[.+?\]: *[^"\n]+?(?: *".+?")?$/

/**
 * Tạo và trả về tiêu đề nhật ký dựa trên nội dung nhật ký.
 *
 * @param content Nội dung nhật ký.
 */
export function makeNoteTitleFromContent(content: string): string {
	if (content === '') return ''

	// Lấy dòng dài nhất.
	const longestLine: string =
		content
			.split(/\n+/)
			.map((line) => line.replace(/ +/g, ' ').trim())

			// Lọc bỏ những dòng link reference.
			.filter((line) => !linkReferenceLineRegex.test(line))

			.sort((a, b) => b.length - a.length)
			.at(0) ?? ''

	// Tạo tiêu đề dựa trên nội dung của dòng dài nhất.
	// Xóa bỏ cú pháp link nếu có để chỉ giữ văn bản thuần.
	const untruncatedTitle: string = longestLine.replace(/\[(.+?)\]\[\d+\]/g, '$1')

	// Cắt ngắn tiêu đề.
	const title: string = truncate(untruncatedTitle, {
		length: 60,
		separator: /\s+/,
		omission: ''
	})
	return title
}
