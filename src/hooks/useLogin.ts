import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { LoginValues } from '../pages/Login'
import { useStore } from '../store/useStore'
import { decryptText } from '../utils/decryptText'
import { getOctokit } from '../utils/getOctokit'
import { slowHashText } from '../utils/slowHashText'

export function useLogin() {
	const encryptedToken = useStore((state) => state.encryptedToken)
	const setToken = useStore((state) => state.setToken)
	const fetchUserData = useStore((state) => state.fetchUserData)

	const request = useRequest(
		async ({ pass }: LoginValues): Promise<boolean> => {
			const key: string = await slowHashText(pass)
			const token: string = decryptText(encryptedToken, key)

			if (token === '') {
				throw Error('Mã bảo mật không đúng')
			}

			const rest: Octokit = getOctokit(token)
			await rest.rateLimit.get()

			setToken(token)
			fetchUserData(token)
			return true
		},
		{ manual: true }
	)
	return request
}
