import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { Modal } from 'antd-mobile'
import { RegisterValues } from '../pages/Register'
import { useStore } from '../store/useStore'
import { encryptText } from '../utils/encryptText'
import { getOctokit } from '../utils/getOctokit'
import { slowHashText } from '../utils/slowHashText'

export function useRegister() {
	const setOrgName = useStore((state) => state.setOrgName)
	const setEncryptedToken = useStore((state) => state.setEncryptedToken)
	const setToken = useStore((state) => state.setToken)

	const request = useRequest(
		async ({ token, orgName, pass }: RegisterValues) => {
			const rest: Octokit = getOctokit(token)

			await rest.rateLimit.get()

			try {
				await rest.repos.get({
					owner: orgName,
					repo: 'diori-main'
				})
			} catch (error: any) {
				if (error.status !== 404) throw error

				const isInitRepo = await Modal.confirm({
					title: 'Khởi tạo repo chính',
					content:
						'Tài khoản GitHub chưa có repo với tên "diori-main". Đây là repo dùng để lưu dữ liệu dạng văn bản, còn hình ảnh được lưu vào các repo khác, sẽ được tạo sau khi cần thiết. Bạn có muốn tạo repo "diori-main" không?',
					confirmText: 'Có và tiếp tục',
					cancelText: 'Không, dừng lại'
				})
				if (!isInitRepo) return

				await rest.repos.createInOrg({
					org: orgName,
					name: 'diori-main',
					private: true,
					description: 'Nhật ký.',
					homepage: 'https://diori.vercel.app',
					auto_init: true,
					has_issues: false,
					has_projects: false,
					has_wiki: false
				})
			}

			const key = await slowHashText(pass)
			const encryptToken = encryptText(token, key)

			setOrgName(orgName)
			setEncryptedToken(encryptToken)
			setToken(token)

			return true
		},
		{ manual: true }
	)
	return request
}
