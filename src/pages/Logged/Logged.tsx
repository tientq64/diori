import KeepAlive from 'react-activation'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export function Logged() {
	const location = useLocation()
	const token = useStore((state) => state.token)

	const keepAliveWhen = () => {
		if (location.pathname === '/notes') {
			return true
		}
		return false
	}

	if (!token) {
		return <Navigate to="/login" replace />
	}

	return (
		<KeepAlive cacheKey={location.pathname} when={keepAliveWhen}>
			<Outlet />
		</KeepAlive>
	)
}
