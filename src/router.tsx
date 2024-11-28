import { Navigate, createBrowserRouter } from 'react-router-dom'
import { Auth } from './pages/Auth'
import { EditPage } from './pages/EditPage'
import { Layout } from './pages/Layout'
import { Logged } from './pages/Logged'
import { Login } from './pages/Login'
import { NotesPage } from './pages/NotesPage'
import { Register } from './pages/Register'
import { SearchPage } from './pages/SearchPage'
import { Settings } from './pages/Settings'

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
				element: <Settings />
			},
			{
				path: '',
				element: <Auth />,
				children: [
					{
						path: 'login',
						element: <Login />
					},
					{
						path: 'register',
						element: <Register />
					}
				]
			},
			{
				path: '',
				element: <Logged />,
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
