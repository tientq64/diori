import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { Dialog } from 'antd-mobile'
import { SettingsState } from '../store/slices/settingsSlice'
import { useAppStore } from '../store/useAppStore'
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

				Dialog.alert({
					content: 'Đã đồng bộ cài từ GitHub.',
					confirmText: 'OK'
				})
			} catch (error: any) {
				if (error.status === 404) {
					Dialog.alert({
						content: 'Không có cài đặt trên GitHub.',
						confirmText: 'OK'
					})
				} else {
					Dialog.alert({
						content: `Đồng bộ cài đặt từ GitHub thất bại: ${String(error)}`,
						confirmText: 'OK'
					})
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
