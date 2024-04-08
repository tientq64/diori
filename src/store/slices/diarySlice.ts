import { RestEndpointMethodTypes } from '@octokit/rest'
import dayjs, { Dayjs } from 'dayjs'
import VietnameseDate from 'vietnamese-date'
import { parseNoteFromNoteData } from '../../utils/parseNoteFromNoteData'
import { SliceCreator } from '../useStore'

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
	NonNullable<RestEndpointMethodTypes['repos']['createOrUpdateFileContents']['response']['data']['content']>
>

export type Status = undefined | 'loading' | 'loaded' | 'loaded-404' | 'failed'
export type Statuses = Record<string, Status>

export type Diary = {
	notes: Notes
	years: Statuses
	currentTime: Dayjs
	currentScrollTop?: number

	getNote: (date: string | Dayjs) => Note
	makeNote: (time: Dayjs) => Note
	updateOrAddNoteFromData: (data: NoteData) => void
	removeNote: (note: Note) => void

	setYear: (year: number, status: Status) => void

	setCurrentTime: (time: Dayjs) => void
	setCurrentScrollTop: (scrollTop: number) => void
}

export const diarySlice: SliceCreator<Diary> = (set, get) => ({
	notes: {},
	years: {},
	editingNote: null,
	currentTime: dayjs(),
	currentScrollTop: undefined,

	getNote: (date) => {
		if (dayjs.isDayjs(date)) {
			date = date.format('YYYY-MM-DD')
		}
		return get().notes[date]
	},

	makeNote: (time) => {
		return {
			date: time.format('YYYY-MM-DD'),
			time,
			lunar: new VietnameseDate(time.toDate()),
			year: time.year(),
			title: '',
			isTitled: false,
			thumbnailUrl: '',
			photoKey: '',
			numberPhotos: 0
		}
	},

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

	removeNote: (note) => {
		set((state) => {
			delete state.notes[note.date]
		})
	},

	setYear: (year, status) => {
		set((state) => {
			state.years[year] = status
		})
	},

	setCurrentTime: (time) => {
		set({ currentTime: time })
	},

	setCurrentScrollTop: (scrollTop) => {
		set({ currentScrollTop: scrollTop })
	}
})
