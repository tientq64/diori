import './utils/configDayjs'

import { useInterval } from 'ahooks'
import { ConfigProvider } from 'antd-mobile'
import antdLocaleEnUS from 'antd-mobile/cjs/locales/en-US'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useStore } from './store/useStore'

export function App() {
	const store = useStore()

	const clearNowInterval = useInterval(() => {
		store.setNowPerMinute(dayjs())
	}, 1000 * 60)

	useEffect(() => {
		document.documentElement.setAttribute(
			'data-prefers-color-scheme',
			store.isDarkMode ? 'dark' : 'light'
		)
	}, [store.isDarkMode])

	useEffect(() => {
		return clearNowInterval
	}, [])

	return (
		<div
			className="h-full"
			style={{
				fontFamily: store.fontFamily,
				fontSize: store.fontSize
			}}
		>
			<ConfigProvider locale={antdLocaleEnUS}>
				<RouterProvider router={router} />
			</ConfigProvider>
		</div>
	)
}
