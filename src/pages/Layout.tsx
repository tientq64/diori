import { Divider } from 'antd-mobile'
import { ReactNode } from 'react'
import { Outlet } from 'react-router'
import { StatusBar } from '../components/StatusBar'

export function Layout(): ReactNode {
	return (
		<div className="flex h-full flex-col">
			<Outlet />

			<Divider className="m-0" />

			<StatusBar />
		</div>
	)
}
