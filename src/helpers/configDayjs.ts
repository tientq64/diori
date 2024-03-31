import dayjs from 'dayjs'
import dayjsLocaleVi from 'dayjs/locale/vi'
import dayjsIsTodayPlugin from 'dayjs/plugin/isToday'
import dayjsLocaleDataPlugin from 'dayjs/plugin/localeData'
import dayjsRelativeTimePlugin from 'dayjs/plugin/relativeTime'

dayjs.locale(dayjsLocaleVi)

dayjs.extend(dayjsIsTodayPlugin)
dayjs.extend(dayjsLocaleDataPlugin)
dayjs.extend(dayjsRelativeTimePlugin)
