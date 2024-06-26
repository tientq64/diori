import { Button, Form, Input, Modal, NavBar } from 'antd-mobile'
import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Page } from '../../components/Page/Page'
import { useStore } from '../../store/useStore'
import { formValidateMessages } from '../../utils/formValidateMessages'
import { useLogin } from '../../hooks/useLogin'
import { useAsyncEffect } from 'ahooks'

export type LoginValues = {
	pass: string
}

export function Login() {
	const store = useStore()
	const [form] = Form.useForm()
	const navigate = useNavigate()
	const login = useLogin()

	useAsyncEffect(async () => {
		const error: any = login.error
		if (!error) return
		if (error.status === 401) {
			await Modal.alert({
				title: 'Đã xảy ra lỗi',
				content: 'Personal access token đã hết hạn. Hãy tạo mới và đăng ký lại.',
				confirmText: 'OK'
			})
			window.open('https://github.com/settings/tokens?type=beta', '_blank')
			return
		}
		form.setFields([
			{
				name: 'pass',
				errors: [error.message]
			}
		])
	}, [login.error])

	useEffect(() => {
		if (!store.token) return
		navigate('/notes', { replace: true })
	}, [store.token])

	useEffect(() => {
		form.setFieldValue('pass', 'test')
		form.submit()
	}, [])

	if (store.token) {
		return <Navigate to="/notes" replace />
	}

	return (
		<Page>
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
					form={form}
					layout="horizontal"
					disabled={login.loading || login.data}
					validateMessages={formValidateMessages}
					onFinish={login.run}
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
						<Button
							type="submit"
							color="primary"
							size="large"
							block
							loading={login.loading}
						>
							Đăng nhập
						</Button>
					</Form.Item>
				</Form>
			</div>
		</Page>
	)
}
