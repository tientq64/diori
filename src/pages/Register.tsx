import { Button, Form, Input, Modal, NavBar } from 'antd-mobile'
import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Link2 } from '../components/Link2'
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
	 * Mã bảo mật đã nhập trong phần đăng ký.
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
					className="md:w-[1200px] max-w-full mx-auto"
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
						description={
							<>
								Tạo và lấy nó{' '}
								<Link2 href="https://github.com/settings/tokens?type=beta">
									tại đây
								</Link2>
								. Tuyệt đối không được chia sẻ mã này với bất kỳ ai.
							</>
						}
						rules={[
							{
								required: true
							}
						]}
					>
						<Input className="text-security" autoComplete="off" />
					</Form.Item>

					<Form.Item
						label="Tên tổ chức GitHub"
						name="orgName"
						description={
							<>
								Tài khoản tổ chức GitHub này sẽ được dùng để lưu trữ nhật ký. Nên
								tạo một tài khoản tổ chức riêng, để tránh việc dữ liệu nhật ký làm
								lộn xộn tài khoản của bạn. Tạo mới{' '}
								<Link2 href="https://github.com/account/organizations/new?plan=free">
									tại đây
								</Link2>
								.
							</>
						}
						rules={[
							{
								required: true
							},
							{
								pattern: /^[\w.-]+$/,
								message: '${label} không hợp lệ'
							}
						]}
					>
						<Input autoComplete="organization" />
					</Form.Item>

					<Form.Item
						label="Mã bảo mật"
						name="pass"
						description="Bạn phải có mã này mới mở được nhật ký."
						rules={[
							{
								min: 4,
								max: 128,
								required: true
							}
						]}
					>
						<Input className="text-security" autoComplete="current-password" />
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
