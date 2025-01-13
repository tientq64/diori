import { Octokit } from '@octokit/rest'
import { LoginValues } from '../pages/LoginPage'
import { useAppStore } from '../store/useAppStore'
import { decryptText } from '../utils/decryptText'
import { getOctokit } from '../utils/getOctokit'
import { slowHashText } from '../utils/slowHashText'

export async function login({ pass }: LoginValues): Promise<boolean> {
	const { encryptedToken, setToken, fetchUserData } = useAppStore.getState()

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
}
