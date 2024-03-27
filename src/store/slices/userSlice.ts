import { SliceCreator } from '../useStore'

export type User = {
	orgName: string
	encryptedToken: string
	token: string

	setOrgName: (orgName: string) => void
	setEncryptedToken: (encryptedToken: string) => void
	setToken: (token: string) => void
}

export const userSlice: SliceCreator<User> = (set) => ({
	orgName: '',
	encryptedToken: '',
	token: '',

	setOrgName: (orgName) => {
		set({ orgName })
	},

	setEncryptedToken: (encryptedToken) => {
		set({ encryptedToken })
	},

	setToken: (token) => {
		set({ token })
	}
})
