import dayjs, { Dayjs } from 'dayjs'
import { SliceCreator } from '../useStore'
import { getOctokit } from '../../helpers/getOctokit'

export type User = {
	orgName: string
	userName: string
	userAvatar: string
	encryptedToken: string
	token: string
	rateLimit: number
	rateLimitRemaining: number
	rateLimitTimeReset: Dayjs | null

	setOrgName: (orgName: string) => void
	setEncryptedToken: (encryptedToken: string) => void
	setToken: (token: string) => void
	setRateLimit: (rateLimit: number) => void
	setRateLimitRemaining: (rateLimitRemaining: number) => void
	setRateLimitTimeReset: (rateLimitReset: number) => void

	fetchUserData: (token: string) => void
}

export const userSlice: SliceCreator<User> = (set) => ({
	orgName: '',
	userName: '',
	userAvatar: '',
	encryptedToken: '',
	token: '',
	rateLimit: 5000,
	rateLimitRemaining: 5000,
	rateLimitTimeReset: null,

	setOrgName: (orgName) => {
		set({ orgName })
	},

	setEncryptedToken: (encryptedToken) => {
		set({ encryptedToken })
	},

	setToken: (token) => {
		set({ token })
	},

	setRateLimit: (rateLimit) => {
		set({ rateLimit })
	},

	setRateLimitRemaining: (rateLimitRemaining) => {
		set({ rateLimitRemaining })
	},

	setRateLimitTimeReset: (rateLimitReset) => {
		const rateLimitTimeReset = dayjs(rateLimitReset)
		set({ rateLimitTimeReset })
	},

	fetchUserData: async (token) => {
		const rest = getOctokit(token)
		const res = await rest.users.getAuthenticated()
		set({
			userName: res.data.login,
			userAvatar: res.data.avatar_url
		})
	}
})
