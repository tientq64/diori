import { useAsyncEffect } from 'ahooks'
import { Button, Form, Input, Modal, NavBar } from 'antd-mobile'
import { ReactNode, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { usePWAInstall } from 'react-use-pwa-install'
import pkg from '../../package.json'
import logoImage from '../assets/images/book.png'
import { Page } from '../components/Page'
import { useLogin } from '../hooks/useLogin'
import { useStore } from '../store/useStore'
import { formValidateMessages } from '../utils/formValidateMessages'

/**
 * Thông tin đăng nhập đã nhập trong phần đăng nhập.
 */
export interface LoginValues {
	/**
	 * Mật khẩu đăng nhập đã nhập trong phần đăng nhập.
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
			// form.submit()
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
						<div className="text-gray-400">Diori {pkg.version}</div>
					</div>

					<Form
						className="w-full"
						form={form}
						mode="card"
						layout="horizontal"
						disabled={login.loading || login.data}
						validateMessages={formValidateMessages}
						onFinish={login.run}
					>
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

					<div className="basis-5/12 flex flex-wrap justify-center items-end gap-6 xs:gap-4 py-2">
						<Link to="/register">Đăng ký</Link>
						<a href="https://github.com/tientq64/diori" target="_blank">
							GitHub
						</a>
						{installPWA && (
							<span onClick={() => installPWA()}>
								{isMd ? 'Cài như ứng dụng' : 'Cài app'}
							</span>
						)}
						<a
							href="https://github.com/tientq64/diori/blob/main/CHANGELOG.md"
							target="_blank"
						>
							Có gì mới?
						</a>
						<a href="https://github.com/tientq64/diori/issues/new" target="_blank">
							Báo lỗi
						</a>
					</div>
				</div>
			</div>
		</Page>
	)
}
