import { useAsyncEffect, useRequest } from 'ahooks'
import { Button, Form, Input, Modal } from 'antd-mobile'
import { ReactNode, useEffect } from 'react'
import { login } from '../services/login'
import { formValidateMessages } from '../utils/formValidateMessages'

export function LoginForm(): ReactNode {
	const [form] = Form.useForm()
	const loginApi = useRequest(login, { manual: true })

	useAsyncEffect(async () => {
		const error: any = loginApi.error
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
			layout="horizontal"
			disabled={loginApi.loading || loginApi.data}
			validateMessages={formValidateMessages}
			onFinish={loginApi.run}
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
				<Input className="text-security" autoComplete="off" autoFocus />
			</Form.Item>

			<Form.Item>
				<Button type="submit" color="primary" size="large" block loading={loginApi.loading}>
					Đăng nhập
				</Button>
			</Form.Item>

			<div className="mt-4 px-4 text-center text-zinc-500">
				Nếu quên mã bảo mật, hãy vào phần đăng ký và đăng ký lại. Đừng lo lắng, dữ liệu của
				bạn sẽ không bị mất.
			</div>
		</Form>
	)
}
