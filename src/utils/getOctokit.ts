import { Octokit } from '@octokit/rest'
import { OctokitResponse } from '@octokit/types'
import { AppStore, useAppStore } from '../store/useAppStore'

/**
 * Trả về đối tượng dùng để thao tác với GitHub API.
 *
 * @param token Personal access token. Nếu `undefined`, token sẽ được lấy trong store.
 */
export function getOctokit(token?: string): Octokit {
	const store: AppStore = useAppStore.getState()
	const rest: Octokit = new Octokit({ auth: token || store.token })

	rest.hook.before('request', (options) => {
		if (typeof options.repo === 'string') {
			// Cache những request này.
			const isPhotoBlobRequest: boolean =
				options.repo.startsWith('diori-photos-') &&
				options.url === '/repos/{owner}/{repo}/git/blobs/{file_sha}'
			if (isPhotoBlobRequest) return
		}
		// Không cache request này.
		options.headers['if-none-match'] = ''
	})

	rest.hook.after('request', (res) => {
		handleHookResponse(res)
	})

	rest.hook.error('request', (error: any) => {
		handleHookResponse(error.response)
		throw error
	})
	return rest
}

const handleHookResponse = (res: OctokitResponse<unknown>): void => {
	if (res.headers['x-ratelimit-resource'] === 'core') {
		const store: AppStore = useAppStore.getState()
		const limit: number = Number(res.headers['x-ratelimit-limit'])
		const reset: number = Number(res.headers['x-ratelimit-reset'])
		const remaining: number = Number(res.headers['x-ratelimit-remaining'])

		if (limit) {
			store.setRateLimitTotal(limit)
		}
		if (remaining) {
			if (
				store.rateLimitTimeReset === null ||
				reset !== store.rateLimitTimeReset.unix() ||
				remaining < store.rateLimitRemaining
			) {
				store.setRateLimitRemaining(remaining)
			}
		}
		if (reset) {
			store.setRateLimitTimeReset(reset * 1000)
		}
	}
}
