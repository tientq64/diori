const replacers: [RegExp, string][] = [
	[/[àáảãạ]/gi, 'a'],
	[/[ằắẳẵặ]/gi, 'ă'],
	[/[ầấẩẫậ]/gi, 'â'],
	[/[èéẻẽẹ]/gi, 'e'],
	[/[ềếểễệ]/gi, 'ê'],
	[/[ìíỉĩị]/gi, 'i'],
	[/[òóỏõọ]/gi, 'o'],
	[/[ồốổỗộ]/gi, 'ô'],
	[/[òớởõợ]/gi, 'ơ'],
	[/[ùúủũụ]/gi, 'u'],
	[/[ừứửữự]/gi, 'ư'],
	[/[ỳýỷỹỵ]/gi, 'y']
]

/**
 * Loại bỏ dấu thanh điệu tiếng Việt trong văn bản.
 *
 * Lưu ý: Các chữ cái tiếng Việt (như ă, â, vv) vẫn được giữ nguyên.
 *
 * @example
 * 'nhật ký' -> 'nhât ky'
 */
export function removeToneMarks(text: string): string {
	let newText: string = text
	for (const replacer of replacers) {
		newText = newText.replace(replacer[0], (char) => {
			if (char.toUpperCase() === char) {
				return replacer[1].toUpperCase()
			}
			return replacer[1]
		})
	}
	return newText
}
