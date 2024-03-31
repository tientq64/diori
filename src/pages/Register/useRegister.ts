import { Modal } from 'antd-mobile'
import useSWRMutation from 'swr/mutation'
import { getOctokit } from '../../helpers/getOctokit'
import { useStore } from '../../store/useStore'
import { encryptText } from '../../utils/encryptText'
import { slowHashText } from '../../utils/slowHashText'
import { RegisterValues } from './Register'

export function useRegister() {
	const store = useStore()

	const swr = useSWRMutation('register', async (_, { arg }: { arg: RegisterValues }) => {
		const { token, orgName, pass } = arg
		const rest = getOctokit(token)

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
					'Tài khoản Github chưa có repo với tên "diori-main". Đây là repo dùng để lưu dữ liệu dạng văn bản, còn hình ảnh được lưu vào các repo khác, sẽ được tạo sau khi cần thiết. Bạn có muốn tạo repo "diori-main" không?',
				confirmText: 'Có và tiếp tục',
				cancelText: 'Không, dừng lại'
			})
			if (!isInitRepo) return

			await rest.repos.createInOrg({
				org: orgName,
				name: 'diori-main',
				has_issues: false,
				has_projects: false,
				has_wiki: false
			})
		}

		const key = await slowHashText(pass)
		const encryptToken = encryptText(token, key)

		store.setOrgName(orgName)
		store.setEncryptedToken(encryptToken)
		store.setToken(token)

		return true
	})

	return swr
}
