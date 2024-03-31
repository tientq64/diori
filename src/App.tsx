import { ConfigProvider } from 'antd-mobile'
import antdLocaleEnUS from 'antd-mobile/cjs/locales/en-US'
import { useEffect } from 'react'
import { AliveScope } from 'react-activation'
import { RouterProvider } from 'react-router-dom'
import './helpers/configDayjs'
import { router } from './router'
import { useStore } from './store/useStore'

export function App() {
	const store = useStore()

	useEffect(() => {
		document.documentElement.setAttribute(
			'data-prefers-color-scheme',
			store.isDarkMode ? 'dark' : 'light'
		)
	}, [store.isDarkMode])

	return (
		<div
			className="h-full"
			style={{
				fontFamily: store.fontFamily,
				fontSize: store.fontSize
			}}
		>
			<ConfigProvider locale={antdLocaleEnUS}>
				<AliveScope>
					<RouterProvider router={router} />
				</AliveScope>
			</ConfigProvider>
		</div>
	)
}
