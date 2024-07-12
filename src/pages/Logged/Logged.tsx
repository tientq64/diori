import { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export function Logged(): ReactNode {
	const token = useStore((state) => state.token)

	if (!token) {
		return <Navigate to="/login" replace />
	}

	return <Outlet />
}
