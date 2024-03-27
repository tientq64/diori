import { ConfigProvider } from 'antd-mobile'
import antdLocaleEnUS from 'antd-mobile/cjs/locales/en-US'
import dayjs from 'dayjs'
import dayjsLocaleVi from 'dayjs/locale/vi'
import dayjsDurationPlugin from 'dayjs/plugin/duration'
import dayjsRelativeTimePlugin from 'dayjs/plugin/relativeTime'
import { AliveScope } from 'react-activation'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

dayjs.locale(dayjsLocaleVi)
dayjs.extend(dayjsRelativeTimePlugin)
dayjs.extend(dayjsDurationPlugin)

export function App() {
	return (
		<ConfigProvider locale={antdLocaleEnUS}>
			<AliveScope>
				<RouterProvider router={router} />
			</AliveScope>
		</ConfigProvider>
	)
}
