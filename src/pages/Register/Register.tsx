import { Button, Form, Input, Modal, NavBar } from 'antd-mobile'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../../components/Page/Page'
import { Store, useStore } from '../../store/useStore'
import { useRegister } from './useRegister'

export type RegisterValues = {
	token: Store['token']
	orgName: Store['orgName']
	pass: string
}

export function Register() {
	const [form] = Form.useForm()
	const store = useStore()
	const { trigger, data, isMutating, error } = useRegister()
	const navigate = useNavigate()

	const handleRegister = (values: RegisterValues) => {
		trigger(values)
	}

	useEffect(() => {
		if (!error) return
		if (error.status === 401) {
			form.setFields([
				{
					name: 'token',
					errors: ['Personal access token không hợp lệ']
				}
			])
			return
		}
		Modal.alert({
			title: 'Đã xảy ra lỗi',
			content: error.message,
			confirmText: 'OK'
		})
	}, [error])

	useEffect(() => {
		if (!data) return
		Modal.alert({
			title: 'Đăng ký thành công',
			content: 'Bạn đã đăng ký thành công, hãy đăng nhập!',
			confirmText: 'Đăng nhập'
		}).then(() => {
			navigate('/login')
		})
	}, [data])

	return (
		<Page>
			<div className="h-full">
				<NavBar
					back={
						<Button fill="none" onClick={() => navigate('/login')}>
							Đăng nhập
						</Button>
					}
				>
					Đăng ký
				</NavBar>
				<Form
					form={form}
					layout="horizontal"
					disabled={isMutating || data}
					onFinish={handleRegister}
				>
					<Form.Item
						label="Personal access token"
						name="token"
						rules={[
							{
								required: true
							}
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Tên tổ chức Github"
						name="orgName"
						description="Tài khoản tổ chức Github sẽ dùng để lưu các repo"
						rules={[
							{
								pattern: /^[\w.-]+$/,
								required: true
							}
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Mật khẩu"
						name="pass"
						rules={[
							{
								min: 4,
								max: 128,
								required: true
							}
						]}
					>
						<Input type="password" />
					</Form.Item>
					<Form.Item>
						<Button
							type="submit"
							color="primary"
							size="large"
							block
							loading={isMutating}
						>
							Đăng ký
						</Button>
					</Form.Item>
				</Form>
			</div>
		</Page>
	)
}
