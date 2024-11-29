import { Button, Form, Input, Modal, NavBar } from 'antd-mobile'
import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../components/Page'
import { useRegister } from '../hooks/useRegister'
import { Store, useStore } from '../store/useStore'
import { formValidateMessages } from '../utils/formValidateMessages'

/**
 * Thông tin đăng ký đã nhập trong phần đăng ký.
 */
export interface RegisterValues {
	/**
	 * Personal access token đã nhập trong phần đăng ký.
	 */
	token: Store['token']
	/**
	 * Tên tổ chức GitHub đã nhập trong phần đăng ký.
	 */
	orgName: Store['orgName']
	/**
	 * Mật khẩu đã nhập trong phần đăng ký.
	 */
	pass: string
}

/**
 * Trang đăng ký.
 * @returns React node.
 */
export function Register(): ReactNode {
	const isMd = useStore((state) => state.isMd)

	const [form] = Form.useForm()
	const register = useRegister()
	const navigate = useNavigate()

	useEffect(() => {
		const error: any = register.error
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
	}, [register.error])

	useEffect(() => {
		if (!register.data) return
		Modal.alert({
			title: 'Đăng ký thành công',
			content: 'Bạn đã đăng ký thành công, hãy đăng nhập!',
			confirmText: 'Đăng nhập'
		}).then(() => {
			navigate('/login')
		})
	}, [register.data])

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
					mode="card"
					layout={isMd ? 'horizontal' : 'vertical'}
					disabled={register.loading || register.data}
					validateMessages={formValidateMessages}
					onFinish={register.run}
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
							loading={register.loading}
						>
							Đăng ký
						</Button>
					</Form.Item>
				</Form>
			</div>
		</Page>
	)
}
