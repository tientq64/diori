import { Outlet } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useEffect } from 'react'

export function Layout() {
	const store = useStore()

	useEffect(() => {
		document.documentElement.setAttribute(
			'data-prefers-color-scheme',
			store.isDarkMode ? 'dark' : 'light'
		)
	}, [store.isDarkMode])

	return <Outlet />
}
