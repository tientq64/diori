import { Octokit } from '@octokit/rest'
import { OctokitResponse } from '@octokit/types'
import { useStore } from '../store/useStore'

export function getOctokit(token?: string): Octokit {
	const store = useStore.getState()

	const rest = new Octokit({ auth: token || store.token })

	const handleResponse = (res: OctokitResponse<unknown>): void => {
		if (res.headers['x-ratelimit-resource'] === 'core') {
			const store = useStore.getState()

			const limit: number = Number(res.headers['x-ratelimit-limit'])
			const reset: number = Number(res.headers['x-ratelimit-reset'])
			const remaining: number = Number(res.headers['x-ratelimit-remaining'])
			if (limit) {
				store.setRateLimit(limit)
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

	rest.hook.before('request', (options) => {
		const repo = options.repo as string | undefined
		const url: string = options.url
		if (
			repo?.startsWith('diori-photos-') &&
			url === '/repos/{owner}/{repo}/git/blobs/{file_sha}'
		)
			return
		options.headers['if-none-match'] = ''
	})

	rest.hook.after('request', (res) => {
		handleResponse(res)
	})

	rest.hook.error('request', (error: any) => {
		handleResponse(error.response)
		throw error
	})

	return rest
}
