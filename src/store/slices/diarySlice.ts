import { RestEndpointMethodTypes } from '@octokit/rest'
import dayjs, { Dayjs } from 'dayjs'
import VietnameseDate from 'vietnamese-date'
import { SliceCreator } from '../useAppStore'

/**
 * Một mục trong nhật ký. Mục nhật ký giống như một mục nhập, chỉ bao gồm ngày, tiêu đề, ảnh thu
 * nhỏ, vv, không bao gồm nội dung chi tiết.
 */
export interface Note {
	/**
	 * Ngày của mục này, dạng `YYYY-MM-DD`.
	 */
	readonly date: string
	/**
	 * Đối tượng `Dayjs` của ngày. Mục đích thuận tiện cho việc thao tác ngày mà không cần tạo mới
	 * mỗi khi dùng.
	 */
	readonly time: Dayjs
	/**
	 * Đối tượng ngày âm lịch.
	 */
	readonly lunar: VietnameseDate
	/**
	 * Năm. Mục đích lấy năm nhanh hơn, không cần phải gọi `time.year()`.
	 */
	readonly year: number
	/**
	 * Tiêu đề. Nếu không được đặt khi lưu, sẽ được tạo tự động dựa trên nội dung đã viết.
	 */
	title: string
	/**
	 * Tiêu đề được đặt bởi người dùng, hay được đặt tự động?
	 */
	isTitled: boolean
	/**
	 * Data URL của hình thu nhỏ. Là chuỗi trống nếu không có.
	 */
	thumbnailUrl: string
	/**
	 * Id của ảnh mặc định. Là chuỗi trống nếu không có.
	 */
	photoKey: string
	/**
	 * Số lượng hình ảnh.
	 */
	numberPhotos: number
	/**
	 * Đường dẫn tập tin GitHub.
	 */
	path?: string
	/**
	 * SHA của tập tin GitHub.
	 */
	sha?: string
}

/**
 * Đối tượng lưu các mục nhật ký. Chỉ các mục có thuộc tính `path` và `sha` mới được lưu vào đây.
 * Key là thuộc tính `date` của mục.
 */
export type Notes = Record<Note['date'], Note>

/**
 * Dữ liệu thô mục nhật ký được trả về từ GitHub API.
 */
export type NoteData = Required<
	NonNullable<
		RestEndpointMethodTypes['repos']['createOrUpdateFileContents']['response']['data']['content']
	>
>

/**
 * Trạng thái tải của năm.
 */
export enum Status {
	/**
	 * Chưa tải.
	 */
	Unloaded,
	/**
	 * Đang tải.
	 */
	Loading,
	/**
	 * Đã tải thành công.
	 */
	Loaded,
	/**
	 * Đã tải thành công nhưng năm đã tải không tồn tại.
	 */
	NotFound,
	/**
	 * Tải thất bại.
	 */
	Failed
}

export interface Diary {
	/**
	 * Danh sách các mục nhật ký. Các mục này đã được lưu trên GitHub.
	 */
	readonly notes: Notes

	/**
	 * Danh sách trạng thái tải của năm.
	 */
	readonly years: Record<string, Status>

	/**
	 * Ngày đang xem trong trang `/notes`.
	 */
	currentTime: Dayjs

	/**
	 * Trả về một mục nhật ký trong danh sách.
	 *
	 * @param date Ngày cần lấy.
	 * @returns Mục nhật ký cần lấy.
	 */
	getNote: (date: string | Dayjs) => Note | undefined

	/**
	 * Tạo một mục nhật ký và trả về. Hành động này không thêm mục nhật ký đã tạo vào danh sách. Nếu
	 * cần thêm vào danh sách, hãy thêm nó vào bằng hàm `setOrAddNote`.
	 *
	 * @param date Ngày của mục nhật ký cần tạo.
	 * @returns Mục nhật ký đã tạo.
	 */
	makeNote: (date: string | Dayjs) => Note

	/**
	 * Cập nhật hoặc thêm mục nhật ký vào danh sách nếu chưa tồn tại.
	 */
	setOrAddNote: (note: Note) => void

	/**
	 * Loại bỏ một mục nhật ký trong danh sách.
	 */
	removeNote: (note: Note) => void

	/**
	 * Trả về trạng thái tải của năm.
	 */
	getYear: (year: number) => Status

	/**
	 * Cập nhật trạng thái tải của năm.
	 *
	 * @param year Năm cần cập nhật.
	 * @param status Trạng thái tải của năm.
	 */
	setYear: (year: number, status: Status) => void

	/**
	 * Cập nhật ngày đang xem trong trang danh sách.
	 */
	setCurrentTime: (time: Dayjs) => void
}

export const diarySlice: SliceCreator<Diary> = (set, get) => ({
	notes: {},
	years: {},
	currentTime: dayjs(),

	getNote: (date) => {
		if (dayjs.isDayjs(date)) {
			date = date.format('YYYY-MM-DD')
		}
		return get().notes[date]
	},

	makeNote: (date) => {
		const time = dayjs(date)
		const newNote: Note = {
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
		return newNote
	},

	setOrAddNote: (note) => {
		set((state) => {
			state.notes[note.date] = note
		})
	},

	removeNote: (note) => {
		set((state) => {
			delete state.notes[note.date]
		})
	},

	getYear: (year) => {
		return get().years[year] ?? Status.Unloaded
	},

	setYear: (year, status) => {
		set((state) => {
			state.years[year] = status
		})
	},

	setCurrentTime: (time) => set({ currentTime: time })
})
