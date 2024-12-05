import { Status } from '../store/slices/diarySlice'

export function checkIsLoadedStatus(status: Status): boolean {
	return status === 'loaded' || status === 'loaded-404'
}
