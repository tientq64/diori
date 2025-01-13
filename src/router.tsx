import { Navigate, createBrowserRouter } from 'react-router'
import { AuthLayout } from './pages/AuthLayout'
import { EditPage } from './pages/EditPage'
import { Layout } from './pages/Layout'
import { LoggedLayout } from './pages/LoggedLayout'
import { LoginPage } from './pages/LoginPage'
import { NotesPage } from './pages/NotesPage'
import { RegisterPage } from './pages/RegisterPage'
import { SearchPage } from './pages/SearchPage'
import { SettingsPage } from './pages/SettingsPage'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <Layout />,
		children: [
			{
				index: true,
				element: <Navigate to="/login" replace />
			},
			{
				path: 'settings',
				element: <SettingsPage />
			},
			{
				path: '',
				element: <AuthLayout />,
				children: [
					{
						path: 'login',
						element: <LoginPage />
					},
					{
						path: 'register',
						element: <RegisterPage />
					}
				]
			},
			{
				path: '',
				element: <LoggedLayout />,
				children: [
					{
						path: 'notes',
						element: <NotesPage />
					},
					{
						path: 'edit/:date',
						element: <EditPage />
					},
					{
						path: 'search',
						element: <SearchPage />
					}
				]
			}
		]
	}
])
