import useSWRMutation from 'swr/mutation'
import { useStore } from '../../store/useStore'
import { LoginValues } from './Login'
import { decryptText } from '../../utils/decryptText'
import { slowHashText } from '../../utils/slowHashText'

export function useLogin() {
	const store = useStore()

	const swr = useSWRMutation('login', async (_, options: { arg: LoginValues }) => {
		const { pass } = options.arg

		const key = await slowHashText(pass)
		const token = decryptText(store.encryptedToken, key)

		if (token === '') {
			throw Error('Mật khẩu không đúng')
		}

		store.setToken(token)

		return true
	})

	return swr
}
