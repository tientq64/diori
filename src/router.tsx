import { Navigate, createBrowserRouter } from 'react-router-dom'
import { Auth } from './pages/Auth/Auth'
import { EditPage } from './pages/EditPage/EditPage'
import { Layout } from './pages/Layout/Layout'
import { Logged } from './pages/Logged/Logged'
import { Login } from './pages/Login/Login'
import { NotesPage } from './pages/NotesPage/NotesPage'
import { Register } from './pages/Register/Register'

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
						path: 'edit',
						element: <EditPage />
					}
				]
			}
		]
	}
])
