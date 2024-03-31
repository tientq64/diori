import { Status } from '../store/slices/diarySlice'

export function isLoadedStatus(status: Status): boolean {
	return status === 'loaded' || status === 'loaded-404'
}
