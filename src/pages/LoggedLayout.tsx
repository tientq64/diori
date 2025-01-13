import { ReactNode } from 'react'
import { Outlet } from 'react-router'
import { LoginForm } from '../components/LoginForm'
import { useAppStore } from '../store/useAppStore'
import { LoginPage } from './LoginPage'

export function LoggedLayout(): ReactNode {
	const token = useAppStore((state) => state.token)

	return (
		<>
			{token === '' && <LoginPage />}
			{token !== '' && <Outlet />}
		</>
	)
}
