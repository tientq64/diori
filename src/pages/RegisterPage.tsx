import { useRequest } from 'ahooks'
import { Button, Form, Input, Modal, NavBar } from 'antd-mobile'
import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Link2 } from '../components/Link2'
import { register } from '../services/register'
import { AppStore, useAppStore } from '../store/useAppStore'
import { formValidateMessages } from '../utils/formValidateMessages'

/**
 * Thông tin đăng ký đã nhập trong phần đăng ký.
 */
export interface RegisterValues {
	/**
	 * Personal access token đã nhập trong phần đăng ký.
	 */
	token: AppStore['token']
	/**
	 * Tên tổ chức GitHub đã nhập trong phần đăng ký.
	 */
	orgName: AppStore['orgName']
	/**
	 * Mã bảo mật đã nhập trong phần đăng ký.
	 */
	pass: string
}

/**
 * Trang đăng ký.
 *
 * @returns React node.
 */
export function RegisterPage(): ReactNode {
	const isMd = useAppStore((state) => state.isMd)

	const [form] = Form.useForm()
	const registerApi = useRequest(register, { manual: true })
	const navigate = useNavigate()

	useEffect(() => {
		const error: any = registerApi.error
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
	}, [registerApi.error])

	useEffect(() => {
		if (!registerApi.data) return
		Modal.alert({
			title: 'Đăng ký thành công',
			content: 'Bạn đã đăng ký thành công, hãy đăng nhập!',
			confirmText: 'Đăng nhập'
		}).then(() => {
			navigate('/login')
		})
	}, [registerApi.data])

	return (
		<div className="flex flex-1 flex-col">
			<NavBar
				back={
					<Button fill="none" onClick={() => navigate('/login')}>
						Đăng nhập
					</Button>
				}
			>
				Đăng ký
			</NavBar>

			<div className="flex flex-1 flex-col items-center justify-center">
				<Form
					className="max-w-full md:w-[1200px]"
					form={form}
					mode="card"
					layout={isMd ? 'horizontal' : 'vertical'}
					disabled={registerApi.loading || registerApi.data}
					validateMessages={formValidateMessages}
					onFinish={registerApi.run}
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
						description="Tương tự như mật khẩu. Bạn phải có mã này mới mở được nhật ký."
						rules={[
							{
								min: 4,
								max: 128,
								required: true
							}
						]}
					>
						<Input className="text-security" autoComplete="off" />
					</Form.Item>

					<Form.Item>
						<Button
							type="submit"
							color="primary"
							size="large"
							block
							loading={registerApi.loading}
						>
							Đăng ký
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	)
}
