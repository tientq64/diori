import { RestEndpointMethodTypes } from '@octokit/rest'
import { Dayjs } from 'dayjs'
import { parseNoteFromNoteData } from '../../utils/parseNoteFromNoteData'
import { SliceCreator } from '../useStore'
import VietnameseDate from 'vietnamese-date'

/**
 * Một mục trong nhật ký.
 */
export type Note = {
	/** Ngày của mục này, dạng YYYY-MM-DD. */
	date: string

	/** Đối tượng Dayjs của ngày. Mục đích thuận tiện cho việc thao tác ngày mà không cần tạo mới mỗi khi dùng. */
	time: Dayjs

	/** Ngày âm lịch. */
	lunar: VietnameseDate

	/** Năm. Mục đích lấy năm nhanh hơn, không cần phải gọi dayjs.year(). */
	year: number

	/** Tiêu đề. Nếu không được đặt khi lưu, sẽ được tạo tự động dựa trên nội dung. */
	title: string

	/** Tiêu đề được đặt bởi người dùng, hay được đặt tự động? */
	isTitled: boolean

	/** Data URL của hình thu nhỏ. Là chuỗi trống nếu không có. */
	thumbnailUrl: string

	/** Id của ảnh mặc định. Là chuỗi trống nếu không có. */
	photoKey: string

	/** Số lượng hình ảnh. */
	numberPhotos: number

	/** Đường dẫn tập tin Github. */
	path?: string

	/** SHA của tập tin Github. */
	sha?: string
}
export type Notes = Record<Note['date'], Note>

export type NoteData = Required<
	NonNullable<
		RestEndpointMethodTypes['repos']['createOrUpdateFileContents']['response']['data']['content']
	>
>

export type Status = undefined | 'loading' | 'loaded' | 'loaded-404' | 'failed'
export type Statuses = Record<string, Status>

export type Diary = {
	notes: Notes
	years: Statuses

	updateOrAddNoteFromData: (data: NoteData) => void

	setYear: (year: number, status: Status) => void
}

export const diarySlice: SliceCreator<Diary> = (set) => ({
	notes: {},
	years: {},
	editingNote: null,

	updateOrAddNoteFromData: (data) => {
		set((state) => {
			const parsedNote = parseNoteFromNoteData(data)
			const { notes } = state
			const { date } = parsedNote
			if (!notes[date]) {
				notes[date] = parsedNote
			} else {
				Object.assign(notes[date], parsedNote)
			}
		})
	},

	setYear: (year, status) => {
		set((state) => {
			state.years[year] = status
		})
	}
})
