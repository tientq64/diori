import { Status } from '../store/slices/diarySlice'

/**
 * Kiểm tra xem trạng thái tải của năm có phải đã tải thành công hay không. Nếu năm đã tải
 * chưa có dữ liệu, cũng là đã tải thành công.
 */
export function checkIsLoadedStatus(status: Status): boolean {
	return status === Status.Loaded || status === Status.NotFound
}
