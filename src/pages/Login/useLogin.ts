import useSWRMutation from 'swr/mutation'
import { useStore } from '../../store/useStore'
import { decryptText } from '../../utils/decryptText'
import { slowHashText } from '../../utils/slowHashText'
import { LoginValues } from './Login'

export function useLogin() {
	const store = useStore()

	const swr = useSWRMutation('login', async (_, { arg }: { arg: LoginValues }) => {
		const { pass } = arg

		const key = await slowHashText(pass)
		const token = decryptText(store.encryptedToken, key)

		if (token === '') {
			throw Error('Mật khẩu không đúng')
		}

		store.setToken(token)
		store.fetchUserData(token)

		return true
	})

	return swr
}
