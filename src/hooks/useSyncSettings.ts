/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRequest } from 'ahooks'
import { Dialog, Toast } from 'antd-mobile'
import { SettingsProps } from '../store/slices/settingsSlice'
import { useStore } from '../store/useStore'
import { base64ToText } from '../utils/base64ToText'
import { getOctokit } from '../utils/getOctokit'

/**
 * Hook đồng bộ hóa cài đặt từ GitHub.
 */
export function useSyncSettings() {
	const store = useStore()

	const request = useRequest(
		async (): Promise<void> => {
			const rest = getOctokit()
			let res: any

			try {
				res = await rest.repos.getContent({
					owner: store.orgName,
					repo: 'diori-main',
					path: 'settings.json'
				})
				const json: string = base64ToText(res.data.content)
				const settingProps: SettingsProps = JSON.parse(json)
				store.setSettingProps(settingProps)

				Toast.show('Đã đồng bộ cài đặt thành công.')
			} catch (error: any) {
				if (error.status === 404) {
					Dialog.alert({ content: 'Không có cài đặt trên GitHub.' })
				} else {
					Dialog.alert({ content: `Đồng bộ cài đặt thất bại: ${String(error)}` })
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
