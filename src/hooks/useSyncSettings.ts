import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { SettingsState } from '../store/slices/settingsSlice'
import { useAppStore } from '../store/useAppStore'
import { showAlert } from '../utils/showAlert'
import { base64ToText } from '../utils/base64ToText'
import { getOctokit } from '../utils/getOctokit'

/**
 * Hook đồng bộ hóa cài đặt từ GitHub.
 */
export function useSyncSettings() {
	const orgName = useAppStore((state) => state.orgName)
	const setSettingsState = useAppStore((state) => state.setSettingsState)

	const request = useRequest(
		async (): Promise<void> => {
			const rest: Octokit = getOctokit()
			let res: any

			try {
				res = await rest.repos.getContent({
					owner: orgName,
					repo: 'diori-main',
					path: 'settings.json'
				})
				const json: string = base64ToText(res.data.content)
				const settingsState: SettingsState = JSON.parse(json)
				setSettingsState(settingsState)

				showAlert('Đã đồng bộ cài đặt từ GitHub.')
			} catch (error: any) {
				if (error.status === 404) {
					showAlert('Không có cài đặt trên GitHub.')
				} else {
					showAlert(`Đồng bộ cài đặt từ GitHub thất bại: ${String(error)}`)
				}
				throw error
			}
		},
		{
			manual: true
		}
	)
	return request
}
