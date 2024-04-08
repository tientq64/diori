import { useRequest } from 'ahooks'
import { nanoid } from 'nanoid'
import { useStore } from '../store/useStore'
import { getOctokit } from '../utils/getOctokit'
import { textToBase64 } from '../utils/textToBase64'

export function useSaveSettings() {
	const store = useStore()

	const request = useRequest(
		async () => {
			const rest = getOctokit()
			let sha: string | undefined
			let res: any

			try {
				res = await rest.repos.getContent({
					owner: store.orgName,
					repo: 'diori-main',
					path: 'settings.json'
				})
				sha = res.data.sha
			} catch (error: any) {
				if (error.status !== 404) throw error
			}

			res = await rest.repos.createOrUpdateFileContents({
				owner: store.orgName,
				repo: 'diori-main',
				path: 'settings.json',
				message: 'Cập nhật cài đặt',
				content: textToBase64(JSON.stringify(store.getSettingsJSON())),
				sha
			})

			return nanoid()
		},
		{
			manual: true
		}
	)
	return request
}
