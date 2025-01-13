import { useRequest } from 'ahooks'
import { nanoid } from 'nanoid'
import { useAppStore } from '../store/useAppStore'
import { getOctokit } from '../utils/getOctokit'
import { textToBase64 } from '../utils/textToBase64'
import { SettingsState } from '../store/slices/settingsSlice'
import { Dialog } from 'antd-mobile'

export function useSaveSettings() {
	const store = useAppStore()

	const request = useRequest(
		async () => {
			const rest = getOctokit()
			let sha: string | undefined
			let res: any

			try {
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

				const settingsState: SettingsState = store.getSettingsState()
				const json: string = JSON.stringify(settingsState, null, '\t')
				const base64: string = textToBase64(json)
				res = await rest.repos.createOrUpdateFileContents({
					owner: store.orgName,
					repo: 'diori-main',
					path: 'settings.json',
					message: 'Cập nhật cài đặt',
					content: base64,
					sha
				})

				Dialog.alert({
					content: 'Đã lưu cài đặt lên GitHub.',
					confirmText: 'OK'
				})
			} catch (error: any) {
				Dialog.alert({
					content: `Lưu cài đặt lên GitHub thất bại: ${String(error)}`,
					confirmText: 'OK'
				})
			}

			return nanoid()
		},
		{
			manual: true
		}
	)
	return request
}
