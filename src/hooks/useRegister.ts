import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { nanoid } from 'nanoid'
import { RegisterValues } from '../pages/RegisterPage'
import { useAppStore } from '../store/useAppStore'
import { encryptText } from '../utils/encryptText'
import { getOctokit } from '../utils/getOctokit'
import { showConfirm } from '../utils/showConfirm'
import { slowHashPassword } from '../utils/slowHashPassword'

export function useRegister() {
	const setOrgName = useAppStore((state) => state.setOrgName)
	const setEncryptedToken = useAppStore((state) => state.setEncryptedToken)
	const setToken = useAppStore((state) => state.setToken)
	const setRegisterSalt = useAppStore((state) => state.setRegisterSalt)

	const request = useRequest(
		async ({ token, orgName, pass }: RegisterValues): Promise<string | undefined> => {
			const rest: Octokit = getOctokit(token)

			await rest.rateLimit.get()
			await rest.orgs.get({ org: orgName })

			try {
				await rest.repos.get({
					owner: orgName,
					repo: 'diori-main'
				})
			} catch (error: any) {
				if (error.status !== 404) throw error

				const isInitRepo: boolean = await showConfirm({
					title: 'Khởi tạo repo chính',
					content: `Tài khoản tổ chức GitHub "${orgName}" của bạn chưa có repo với tên "diori-main". Đây là repo dùng để lưu dữ liệu nhật ký dạng văn bản, còn hình ảnh được lưu vào các repo khác, sẽ tự động được tạo sau, khi cần thiết. Bạn có muốn tạo repo "diori-main" không?`,
					confirmText: 'Có và tiếp tục',
					cancelText: 'Không, dừng lại'
				})
				if (!isInitRepo) return

				await rest.repos.createInOrg({
					org: orgName,
					name: 'diori-main',
					description: 'Nhật ký.',
					homepage: 'https://diori.vercel.app',
					private: true,
					auto_init: true,
					has_issues: false,
					has_projects: false,
					has_wiki: false
				})
			}

			const registerSalt: string = nanoid()
			const derivedKey: string = await slowHashPassword(pass, registerSalt)
			const encryptToken: string = encryptText(token, derivedKey)

			setOrgName(orgName)
			setRegisterSalt(registerSalt)
			setEncryptedToken(encryptToken)

			setToken(token)

			// Trả về một chuỗi ngẫu nhiên tượng trưng cho mỗi lần đăng ký thành công.
			return nanoid()
		},
		{ manual: true }
	)
	return request
}
