import { Octokit } from '@octokit/rest'
import { useRequest } from 'ahooks'
import { ImageUploadItem } from 'antd-mobile'
import { Dayjs } from 'dayjs'
import { find } from 'lodash'
import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { GitGetBlobResponse, GitGetTreeResponse, ReposGetCommitResponse } from '../types/octokit'
import { getOctokit } from '../utils/getOctokit'
import { makePhotoFileName } from '../utils/makePhotoFileName'

export type PhotoLoaderStatus = undefined | 'loading' | 'loaded' | 'failed'

export function usePhotosLoader() {
	const orgName = useStore((state) => state.orgName)

	const createdBlobUrls = useRef<string[]>([])

	// Biến promise cache các bước lấy hình ảnh bằng GitHub API.
	const promiseA = useRef<Promise<ReposGetCommitResponse>>()
	const promiseB = useRef<Promise<GitGetTreeResponse>>()
	const promiseC = useRef<Promise<GitGetTreeResponse>>()
	const promiseD = useRef<Promise<GitGetTreeResponse>>()
	const promiseE = useRef<Promise<GitGetBlobResponse>>()

	const request = useRequest(
		async (time: Dayjs, image: ImageUploadItem): Promise<string> => {
			if (typeof image.key !== 'string') {
				throw TypeError('Hình ảnh không hợp lệ')
			}

			const rest: Octokit = getOctokit()
			const photoRepoName: string = `diori-photos-${time.year()}`

			promiseA.current ??= rest.repos.getCommit({
				owner: orgName,
				repo: photoRepoName,
				ref: 'heads/main'
			})
			const resA = await promiseA.current

			promiseB.current ??= rest.git.getTree({
				owner: orgName,
				repo: photoRepoName,
				tree_sha: resA.data.sha
			})
			const resB = await promiseB.current
			const monthFolderNode = find(resB.data.tree, { path: time.format('MM') })
			if (monthFolderNode === undefined || monthFolderNode.sha === undefined) {
				throw Error('Không tìm thấy thư mục ảnh')
			}

			promiseC.current ??= rest.git.getTree({
				owner: orgName,
				repo: photoRepoName,
				tree_sha: monthFolderNode.sha
			})
			const resC = await promiseC.current
			const dateFolderNode = find(resC.data.tree, { path: time.format('DD') })
			if (dateFolderNode === undefined || dateFolderNode.sha === undefined) {
				throw Error('Không tìm thấy thư mục ảnh')
			}

			promiseD.current ??= rest.git.getTree({
				owner: orgName,
				repo: photoRepoName,
				tree_sha: dateFolderNode.sha
			})
			const resD = await promiseD.current
			const photoFileName: string = makePhotoFileName(time, image.key)
			const photoFileNode = find(resD.data.tree, {
				path: photoFileName
			})
			if (photoFileNode === undefined || photoFileNode.sha === undefined) {
				throw Error('Không tìm thấy tập tin ảnh')
			}

			promiseE.current ??= rest.git.getBlob({
				owner: orgName,
				repo: photoRepoName,
				file_sha: photoFileNode.sha
			})
			const resE = await promiseE.current
			const buf: Uint8ClampedArray = Uint8ClampedArray.from(atob(resE.data.content), (ch) => {
				return ch.charCodeAt(0)
			})
			const blob: Blob = new Blob([buf], {
				type: 'image/webp'
			})
			const blobUrl: string = URL.createObjectURL(blob)
			createdBlobUrls.current.push(blobUrl)

			return blobUrl
		},
		{ manual: true }
	)

	// Thu hồi blob URL ảnh đã tạo để giải phóng bộ nhớ.
	useEffect(() => {
		return () => {
			const blobUrls: string[] = createdBlobUrls.current
			for (const blobUrl of blobUrls) {
				URL.revokeObjectURL(blobUrl)
			}
		}
	}, [])

	return request
}
