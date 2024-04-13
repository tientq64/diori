import { Dayjs } from 'dayjs'

export function makePhotoPath(time: Dayjs, key: string) {
	return `${time.format('MM/DD')}/${time.format('YYYYMMDD')}-${key}.webp`
}
