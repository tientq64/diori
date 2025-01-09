import { ConfigProvider } from 'antd-mobile'
import antdLocaleEnUS from 'antd-mobile/cjs/locales/en-US'
import dayjs from 'dayjs'
import { ReactNode, useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './router'
import { useStore } from './store/useStore'

export function App(): ReactNode {
	const isDarkMode = useStore((state) => state.isDarkMode)
	const fontFamily = useStore((state) => state.fontFamily)
	const fontSize = useStore((state) => state.fontSize)
	const updateResponsive = useStore((state) => state.updateResponsive)
	const setNowPerMinute = useStore((state) => state.setNowPerMinute)

	const resizeHandle = (): void => {
		updateResponsive()
	}

	useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add('dark')
			document.documentElement.classList.remove('light')
		} else {
			document.documentElement.classList.add('light')
			document.documentElement.classList.remove('dark')
		}
		document.documentElement.setAttribute(
			'data-prefers-color-scheme',
			isDarkMode ? 'dark' : 'light'
		)
	}, [isDarkMode])

	useEffect(() => {
		const intervalId: number = setInterval(() => {
			setNowPerMinute(dayjs())
		}, 1000 * 60)

		window.addEventListener('resize', resizeHandle)
		resizeHandle()

		return () => {
			clearInterval(intervalId)
			window.removeEventListener('resize', resizeHandle)
		}
	}, [])

	return (
		<div
			className="h-full"
			style={{
				fontFamily: fontFamily,
				fontSize: fontSize
			}}
		>
			<ConfigProvider locale={antdLocaleEnUS}>
				<RouterProvider router={router} />
			</ConfigProvider>

			<style>{`
				:root {
					--adm-font-family: ${fontFamily};
				}
				.monaco-hover {
					font-family: ${fontFamily};
				}
			`}</style>
		</div>
	)
}
