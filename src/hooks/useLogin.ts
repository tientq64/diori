import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { nanoid } from 'nanoid'
import { LoginValues } from '../pages/LoginPage'
import { useAppStore } from '../store/useAppStore'
import { decryptText } from '../utils/decryptText'
import { getOctokit } from '../utils/getOctokit'
import { slowHashPassword } from '../utils/slowHashPassword'

export function useLogin() {
	const encryptedToken = useAppStore((state) => state.encryptedToken)
	const registerSalt = useAppStore((state) => state.registerSalt)
	const setToken = useAppStore((state) => state.setToken)
	const fetchUserData = useAppStore((state) => state.fetchUserData)

	const request = useRequest(
		async ({ pass }: LoginValues): Promise<string | undefined> => {
			const derivedKey: string = await slowHashPassword(pass, registerSalt)
			const token: string = decryptText(encryptedToken, derivedKey)

			if (token === '') {
				throw Error('Mật khẩu nhật ký không đúng')
			}

			const rest: Octokit = getOctokit(token)
			await rest.rateLimit.get()

			setToken(token)
			fetchUserData(token)

			// Trả về một chuỗi ngẫu nhiên tượng trưng cho mỗi lần đăng nhập thành công.
			return nanoid()
		},
		{ manual: true }
	)
	return request
}
