import { useAsyncEffect, useRequest } from 'ahooks'
import { Button, Divider, Form, Input, Modal, NavBar } from 'antd-mobile'
import { ReactNode, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { usePWAInstall } from 'react-use-pwa-install'
import logoImage from '../assets/images/book.png'
import { Brand } from '../components/Brand'
import { Link2 } from '../components/Link2'
import { login } from '../services/login'
import { useAppStore } from '../store/useAppStore'
import { formValidateMessages } from '../utils/formValidateMessages'
import { LoginForm } from '../components/LoginForm'

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
export function LoginPage(): ReactNode {
	const token = useAppStore((state) => state.token)
	const isMd = useAppStore((state) => state.isMd)

	const navigate = useNavigate()
	const installPWA = usePWAInstall()

	// Chuyển đến trang "/notes" khi có token.
	useEffect(() => {
		if (!token) return
		navigate('/notes', { replace: true })
	}, [token])

	return (
		<div className="flex flex-1 flex-col">
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

			<div className="flex flex-1 flex-col items-center">
				<div className="flex basis-7/12 flex-col items-center justify-center gap-2">
					<img className="w-32" src={logoImage} />
					<Brand />
				</div>

				<LoginForm />

				<div className="flex basis-5/12 items-end justify-center py-2">
					<div className="flex flex-wrap items-center justify-center px-6">
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

						<Link2 href="https://github.com/tientq64/diori/issues/new">Báo lỗi</Link2>
					</div>
				</div>
			</div>
		</div>
	)
}
