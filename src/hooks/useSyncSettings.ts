/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRequest } from 'ahooks'
import { Dialog } from 'antd-mobile'
import { SettingsProps } from '../store/slices/settingsSlice'
import { useStore } from '../store/useStore'
import { base64ToText } from '../utils/base64ToText'
import { getOctokit } from '../utils/getOctokit'

/**
 * Hook đồng bộ hóa cài đặt từ GitHub.
 */
export function useSyncSettings() {
	const orgName = useStore((state) => state.orgName)
	const setSettingsProps = useStore((state) => state.setSettingsProps)

	const request = useRequest(
		async (): Promise<void> => {
			const rest = getOctokit()
			let res: any

			try {
				res = await rest.repos.getContent({
					owner: orgName,
					repo: 'diori-main',
					path: 'settings.json'
				})
				const json: string = base64ToText(res.data.content)
				const settingsProps: SettingsProps = JSON.parse(json)
				setSettingsProps(settingsProps)

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
