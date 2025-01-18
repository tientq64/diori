import { useAsyncEffect } from 'ahooks'
import { Button, Form, Input } from 'antd-mobile'
import { ReactNode, useEffect } from 'react'
import { useLogin } from '../hooks/useLogin'
import { formValidateMessages } from '../utils/formValidateMessages'
import { showConfirm } from '../utils/showConfirm'
import { useAppStore } from '../store/useAppStore'

export function LoginForm(): ReactNode {
	const isMd = useAppStore((state) => state.isMd)

	const [form] = Form.useForm()
	const loginApi = useLogin()

	useAsyncEffect(async () => {
		const error: any = loginApi.error
		if (!error) return
		if (error.status === 401) {
			const isGoToGitHubSetting: boolean = await showConfirm({
				title: 'Đã xảy ra lỗi',
				content: 'Personal access token đã hết hạn. Tạo một cái mới?',
				confirmText: 'OK, đi đến cài đặt GitHub',
				cancelText: 'Để sau'
			})
			if (isGoToGitHubSetting) {
				window.open('https://github.com/settings/tokens?type=beta', '_blank')
			}
		} else {
			form.setFields([
				{
					name: 'pass',
					errors: [error.message]
				}
			])
		}
	}, [loginApi.error])

	// Tự động đăng nhập khi dev.
	useEffect(() => {
		if (import.meta.env.DEV) {
			form.setFieldValue('pass', 'test')
			form.submit()
		}
	}, [])

	return (
		<Form
			className="w-full max-w-full md:w-[800px]"
			form={form}
			mode="card"
			layout={isMd ? 'horizontal' : 'vertical'}
			disabled={loginApi.loading || loginApi.data}
			validateMessages={formValidateMessages}
			onFinish={loginApi.run}
		>
			<Form.Item
				label="Mật khẩu nhật ký"
				name="pass"
				rules={[
					{
						required: true
					}
				]}
			>
				<Input className="text-security" autoComplete="off" autoFocus />
			</Form.Item>

			<Form.Item>
				<Button type="submit" color="primary" size="large" block loading={loginApi.loading}>
					Đăng nhập
				</Button>
			</Form.Item>

			<div className="mt-4 px-4 text-center text-zinc-500">
				Nếu quên mật khẩu nhật ký, hãy vào phần đăng ký và đăng ký lại. Đừng lo lắng, dữ
				liệu của bạn sẽ không bị mất.
			</div>
		</Form>
	)
}
