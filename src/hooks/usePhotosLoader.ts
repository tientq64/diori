import { useRequest } from 'ahooks'
import { ImageUploadItem } from 'antd-mobile'
import { Dayjs } from 'dayjs'
import { find } from 'lodash'
import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { getOctokit } from '../utils/getOctokit'

export type PhotoLoaderStatus = undefined | 'loading' | 'loaded' | 'failed'

export function usePhotosLoader() {
	const store = useStore()
	const blobUrlsRef = useRef<string[]>([])

	const request = useRequest(
		async (time: Dayjs, image: ImageUploadItem): Promise<string> => {
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

			res = await rest.git.getTree({
				owner: store.orgName,
				repo: repoName,
				tree_sha: node.sha!
			})
			node = find(res.data.tree, { path: `${time.format('YYYYMMDD')}-${image.key}.webp` })
			if (!node) throw Error('Không tìm thấy tập tin ảnh')

			res = await rest.git.getBlob({
				owner: store.orgName,
				repo: repoName,
				file_sha: node.sha!
			})
			const buf: Uint8ClampedArray = Uint8ClampedArray.from(atob(res.data.content), (ch) =>
				ch.charCodeAt(0)
			)
			const blob: Blob = new Blob([buf], { type: 'image/webp' })
			const blobUrl: string = URL.createObjectURL(blob)
			blobUrlsRef.current.push(blobUrl)

			return blobUrl
		},
		{
			manual: true
		}
	)

	// Thu hồi blob URL ảnh đã tạo để giải phóng bộ nhớ.
	useEffect(() => {
		const blobUrls = blobUrlsRef.current
		return () => {
			for (const blobUrl of blobUrls) {
				URL.revokeObjectURL(blobUrl)
			}
		}
	}, [])

	return request
}
