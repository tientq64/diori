import { Octokit } from '@octokit/rest'
import { OctokitResponse } from '@octokit/types'
import { useStore } from '../store/useStore'

export function getOctokit(token?: string) {
	const store = useStore.getState()

	const rest = new Octokit({ auth: token || store.token })

	const handleResponse = (res: OctokitResponse<any>) => {
		const limit = res.headers['x-ratelimit-limit']
		const remaining = res.headers['x-ratelimit-remaining']
		const reset = res.headers['x-ratelimit-reset']
		if (limit) {
			store.setRateLimit(Number(limit))
		}
		if (remaining) {
			store.setRateLimitRemaining(Number(remaining))
		}
		if (reset) {
			store.setRateLimitTimeReset(Number(reset) * 1000)
		}
	}

	rest.hook.before('request', (options) => {
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
