import VietnameseDate from 'vietnamese-date'

/**
 * Trả về tên can chi của năm âm lịch.
 * @param year Năm âm lịch.
 * @returns Tên can chi của năm âm lịch.
 *
 * @example
 * getLunarYearName(2024) // 'Giáp Thìn'
 */
export function getLunarYearName(year: number): string {
	const lunarTime: VietnameseDate = new VietnameseDate(year)
	return lunarTime.celestialStemOfYear + ' ' + lunarTime.terrestrialBranchOfYear
}
