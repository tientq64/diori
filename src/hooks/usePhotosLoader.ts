import { useRequest } from 'ahooks'
import { Dayjs } from 'dayjs'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import { getOctokit } from '../utils/getOctokit'
import { find } from 'lodash'

export type PhotoLoaderStatus = undefined | 'loading' | 'loaded' | 'failed'

export function usePhotosLoader() {
	const store = useStore()
	// TEMP
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const photoBlobUrls = useState<Record<string, string>>({})

	const request = useRequest(
		// TEMP
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		async (time: Dayjs, photoKey: string) => {
			const rest = getOctokit()
			const repoName = `diori-photos-${time.year()}`
			let res, node

			res = await rest.repos.getCommit({
				owner: store.orgName,
				repo: repoName,
				ref: 'heads/main'
			})

			res = await rest.git.getTree({
				owner: store.orgName,
				repo: repoName,
				tree_sha: res.data.sha
			})
			node = find(res.data.tree, { path: time.format('MM') })
			if (!node) throw Error('Không tìm thấy thư mục ảnh')

			res = await rest.git.getTree({
				owner: store.orgName,
				repo: repoName,
				tree_sha: node.sha!
			})
			node = find(res.data.tree, { path: time.format('DD') })
			if (!node) throw Error('Không tìm thấy thư mục ảnh')
		},
		{
			manual: true
		}
	)
	return request
}
