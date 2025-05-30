import { useAsyncEffect } from 'ahooks'
import { Button, Form, Input, NavBar } from 'antd-mobile'
import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Link2 } from '../components/Link2'
import { useRegister } from '../hooks/useRegister'
import { AppStore, useAppStore } from '../store/useAppStore'
import { formValidateMessages } from '../utils/formValidateMessages'
import { showAlert } from '../utils/showAlert'

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
	 * Mật khẩu nhật ký đã nhập trong phần đăng ký.
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
	const setToken = useAppStore((state) => state.setToken)

	const [form] = Form.useForm()
	const registerApi = useRegister()
	const navigate = useNavigate()

	useEffect(() => {
		const error: any = registerApi.error
		if (!error) return

		switch (error.status) {
			case 401:
				form.setFields([
					{
						name: 'token',
						errors: ['Personal access token không hợp lệ']
					}
				])
				break

			case 403:
				showAlert({
					title: `Đã xảy ra lỗi: ${error.status}`,
					content: 'Bạn cần quyền admin để truy cập vào tổ chức GitHub này',
					confirmText: 'OK'
				})
				break

			case 404:
				form.setFields([
					{
						name: 'orgName',
						errors: ['Tên tổ chức GitHub không tồn tại']
					}
				])
				break

			default:
				showAlert({
					title: `Đã xảy ra lỗi: ${error.status}`,
					content: String(error),
					confirmText: 'OK'
				})
				break
		}
	}, [registerApi.error])

	useAsyncEffect(async () => {
		if (!registerApi.data) return
		await showAlert({
			title: 'Đăng ký thành công',
			content: 'Bạn đã đăng ký thành công, hãy đăng nhập!',
			confirmText: 'Đăng nhập ngay'
		})
		navigate('/login')
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
					disabled={registerApi.loading}
					validateMessages={formValidateMessages}
					onFinish={registerApi.run}
				>
					<Form.Item
						label="Personal access token"
						name="token"
						description={
							<>
								Tương tự như mật khẩu GitHub. Tuyệt đối không chia sẻ mã
								này với bất kỳ ai. Tạo và lấy nó{' '}
								<Link2 href="https://github.com/settings/tokens?type=beta">
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
								pattern: /^[a-zA-Z0-9_]+$/,
								message: '${label} chứa các ký tự không hợp lệ'
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
								Tài khoản tổ chức GitHub này sẽ được dùng để lưu trữ nhật
								ký. Nên tạo một tài khoản tổ chức riêng, để tránh việc dữ
								liệu nhật ký làm lộn xộn tài khoản của bạn. Tạo mới{' '}
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
						label="Mật khẩu nhật ký"
						name="pass"
						description="Mật khẩu nhật ký. Bạn phải có mã này mới mở được nhật ký."
						validateFirst
						rules={[
							{
								min: 4,
								max: 128,
								required: true
							},
							{
								pattern: /^.{6,}$/,
								message: '${label} có vẻ hơi ngắn',
								warningOnly: true
							},
							{
								pattern: /[^a-zA-Z0-9]/,
								message: '${label} nên chứa cả ký tự đặc biệt',
								warningOnly: true
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
