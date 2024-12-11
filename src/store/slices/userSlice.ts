import { Octokit } from '@octokit/rest'
import dayjs, { Dayjs } from 'dayjs'
import { getOctokit } from '../../utils/getOctokit'
import { SliceCreator } from '../useStore'

export interface User {
	/**
	 * Tên tổ chức GitHub mà người dùng dùng để lưu dữ liệu nhật ký.
	 */
	orgName: string
	/**
	 * Tên đăng nhập GitHub của người dùng.
	 */
	userName: string
	/**
	 * URL hình đại diện GitHub của người dùng.
	 */
	userAvatar: string
	/**
	 * GitHub personal access token đã được mã hóa. Được lưu trong `localStorage` để xác thực khi đăng nhập.
	 */
	encryptedToken: string
	/**
	 * GitHub personal access token.
	 */
	token: string
	/**
	 * Tổng số giới hạn lệnh gọi GitHub API.
	 */
	rateLimit: number
	/**
	 * Giới hạn lệnh gọi GitHub API còn lại.
	 */
	rateLimitRemaining: number
	/**
	 * Mốc thời gian mà giới hạn lệnh gọi GitHub API sẽ được đặt lại.
	 */
	rateLimitTimeReset: Dayjs | null
	/**
	 * Thời gian hiện tại, được cập nhật ít nhất mỗi phút một lần.
	 */
	nowPerMinute: Dayjs
	/**
	 * Chiều dài màn hình lớn hơn hoặc bằng 768px?
	 */
	isMd: boolean
	/**
	 * Chiều dài màn hình nhỏ hơn 768px?
	 */
	isXs: boolean

	setOrgName: (orgName: string) => void
	setEncryptedToken: (encryptedToken: string) => void
	setToken: (token: string) => void
	setRateLimit: (rateLimit: number) => void
	setRateLimitRemaining: (rateLimitRemaining: number) => void
	setRateLimitTimeReset: (timestamp: number) => void
	setNowPerMinute: (time: Dayjs) => void
	/**
	 * Cập nhật giá trị responsive. Gồm 2 giá trị `isMd` và `isXs`.
	 */
	updateResponsive: () => void
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
	nowPerMinute: dayjs(),
	isMd: true,
	isXs: false,

	setOrgName: (orgName) => set({ orgName }),
	setEncryptedToken: (encryptedToken) => set({ encryptedToken }),
	setToken: (token) => set({ token }),
	setRateLimit: (rateLimit) => set({ rateLimit }),
	setRateLimitRemaining: (rateLimitRemaining) => set({ rateLimitRemaining }),

	setRateLimitTimeReset: (timestamp) => {
		const rateLimitTimeReset = dayjs(timestamp)
		set({ rateLimitTimeReset })
	},

	setNowPerMinute: (time) => set({ nowPerMinute: time }),

	updateResponsive: () => {
		const isMd: boolean = window.innerWidth >= 768
		set({ isMd, isXs: !isMd })
	},

	fetchUserData: async (token) => {
		const rest: Octokit = getOctokit(token)
		const res = await rest.users.getAuthenticated()
		set({
			userName: res.data.login,
			userAvatar: res.data.avatar_url
		})
	}
})
