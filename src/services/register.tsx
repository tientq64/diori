import { Octokit } from '@octokit/rest'
import { Modal } from 'antd-mobile'
import { RegisterValues } from '../pages/RegisterPage'
import { useAppStore } from '../store/useAppStore'
import { encryptText } from '../utils/encryptText'
import { getOctokit } from '../utils/getOctokit'
import { slowHashText } from '../utils/slowHashText'

export async function register({ token, orgName, pass }: RegisterValues): Promise<boolean> {
	const { setOrgName, setEncryptedToken, setToken } = useAppStore.getState()

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
		if (!isInitRepo) return false

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
}
