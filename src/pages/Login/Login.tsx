import { Button, Form, Input, NavBar } from 'antd-mobile'
import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useLogin } from './useLogin'

export type LoginValues = {
	pass: string
}

export function Login() {
	const store = useStore()

	const [form] = Form.useForm()
	const navigate = useNavigate()
	const { trigger, data, isMutating, error } = useLogin()

	const handleLogin = (values: LoginValues) => {
		trigger(values)
	}

	useEffect(() => {
		if (!error) return
		form.setFields([
			{
				name: 'pass',
				errors: [error.message]
			}
		])
	}, [error])

	useEffect(() => {
		if (!store.token) return
		navigate('/notes', { replace: true })
	}, [store.token])

	if (store.token) {
		return <Navigate to="/notes" replace />
	}

	return (
		<div className="h-full">
			<NavBar
				backArrow={false}
				right={
					<Button fill="none" onClick={() => navigate('/register')}>
						Đăng ký
					</Button>
				}
			>
				Đăng nhập
			</NavBar>

			<Form
				className="pr-1"
				form={form}
				layout="horizontal"
				disabled={isMutating || data}
				onFinish={handleLogin}
			>
				<Form.Item>
					<div className="mx-auto my-24 text-center text-9xl">🏕️</div>
				</Form.Item>

				<Form.Item
					label="Mật khẩu"
					name="pass"
					rules={[
						{
							required: true
						}
					]}
				>
					<Input type="password" autoFocus />
				</Form.Item>

				<Form.Item>
					<Button type="submit" color="primary" size="large" block loading={isMutating}>
						Đăng nhập
					</Button>
				</Form.Item>
			</Form>
		</div>
	)
}
