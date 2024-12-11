import { useAsyncEffect } from 'ahooks'
import { Button, Divider, Form, Input, Modal, NavBar } from 'antd-mobile'
import { ReactNode, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { usePWAInstall } from 'react-use-pwa-install'
import logoImage from '../assets/images/book.png'
import { Brand } from '../components/Brand'
import { Link2 } from '../components/Link2'
import { Page } from '../components/Page'
import { useLogin } from '../hooks/useLogin'
import { useStore } from '../store/useStore'
import { formValidateMessages } from '../utils/formValidateMessages'

/**
 * Thông tin đăng nhập đã nhập trong phần đăng nhập.
 */
export interface LoginValues {
	/**
	 * Mã bảo mật đã nhập trong phần đăng nhập.
	 */
	pass: string
}

/**
 * Trang đăng nhập.
 */
export function Login(): ReactNode {
	const token = useStore((state) => state.token)
	const isMd = useStore((state) => state.isMd)

	const login = useLogin()
	const [form] = Form.useForm()
	const navigate = useNavigate()
	const installPWA = usePWAInstall()

	useAsyncEffect(async () => {
		const error: any = login.error
		if (!error) return
		if (error.status === 401) {
			const isGoToGitHubSetting: boolean = await Modal.confirm({
				title: 'Đã xảy ra lỗi',
				content: 'Personal access token đã hết hạn. Tạo một cái mới?',
				confirmText: 'OK',
				cancelText: 'Để sau'
			})
			if (isGoToGitHubSetting) {
				window.open('https://github.com/settings/tokens?type=beta', '_blank')
			}
			return
		}
		form.setFields([
			{
				name: 'pass',
				errors: [error.message]
			}
		])
	}, [login.error])

	// Chuyển đến trang "/notes" khi có token.
	useEffect(() => {
		if (!token) return
		navigate('/notes', { replace: true })
	}, [token])

	// Tự động đăng nhập khi dev.
	useEffect(() => {
		if (import.meta.env.DEV) {
			form.setFieldValue('pass', 'test')
			form.submit()
		}
	}, [])

	if (token) {
		return <Navigate to="/notes" replace />
	}

	return (
		<Page>
			<div className="flex flex-col h-full">
				<NavBar
					backIcon={null}
					right={
						<Button fill="none" onClick={() => navigate('/register')}>
							Đăng ký
						</Button>
					}
				>
					Đăng nhập
				</NavBar>

				<div className="flex-1 flex flex-col items-center">
					<div className="basis-7/12 flex flex-col justify-center items-center gap-2">
						<img className="w-32" src={logoImage} />
						<Brand />
					</div>

					<Form
						className="w-full md:w-[800px] max-w-full"
						form={form}
						mode="card"
						layout="horizontal"
						disabled={login.loading || login.data}
						validateMessages={formValidateMessages}
						onFinish={login.run}
					>
						<Form.Item
							label="Mã bảo mật"
							name="pass"
							rules={[
								{
									required: true
								}
							]}
						>
							<Input
								className="text-security"
								autoComplete="current-password"
								autoFocus
							/>
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

						<div className="px-4 mt-4 text-center text-zinc-500">
							Nếu quên mã bảo mật, hãy vào phần đăng ký và đăng ký lại. Đừng lo lắng,
							dữ liệu của bạn sẽ không bị mất.
						</div>
					</Form>

					<div className="basis-5/12 flex justify-center items-end py-2">
						<div className="flex flex-wrap justify-center items-center px-6">
							<Link2 to="/register">Đăng ký</Link2>
							<Divider direction="vertical" />

							<Link2 href="https://github.com/tientq64/diori">GitHub</Link2>
							<Divider direction="vertical" />

							{installPWA && (
								<Link2 onClick={() => installPWA()}>
									{isMd ? 'Cài như ứng dụng' : 'Cài app'}
								</Link2>
							)}
							<Divider direction="vertical" />

							<Link2 href="https://github.com/tientq64/diori/blob/main/CHANGELOG.md">
								Có gì mới?
							</Link2>
							<Divider direction="vertical" />

							<Link2 href="https://github.com/tientq64/diori/issues/new">
								Báo lỗi
							</Link2>
						</div>
					</div>
				</div>
			</div>
		</Page>
	)
}
