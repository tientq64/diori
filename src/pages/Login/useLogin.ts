import { useRequest } from 'ahooks'
import { useStore } from '../../store/useStore'
import { decryptText } from '../../utils/decryptText'
import { slowHashText } from '../../utils/slowHashText'
import { LoginValues } from './Login'
import { getOctokit } from '../../helpers/getOctokit'

export function useLogin() {
	const store = useStore()

	const request = useRequest(
		async ({ pass }: LoginValues) => {
			const key = await slowHashText(pass)
			const token = decryptText(store.encryptedToken, key)

			if (token === '') {
				throw Error('Mật khẩu không đúng')
			}

			const rest = getOctokit(token)
			await rest.rateLimit.get()

			store.setToken(token)
			store.fetchUserData(token)

			return true
		},
		{
			manual: true
		}
	)

	return request
}
