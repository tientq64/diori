import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

export function Layout(): ReactNode {
	return <Outlet />
}
