import { Octokit, RestEndpointMethodTypes } from '@octokit/rest'

type Tree = RestEndpointMethodTypes['git']['createTree']['parameters']['tree']

/**
 * Tập tin thêm vào commit.
 */
export interface AddedCommitFile {
	/**
	 * Đường dẫn tập tin trên GitHub.
	 */
	path: string
	/**
	 * Nội dung tập tin, dạng base64.
	 */
	content: string
}

/**
 * Các tham số truyền vào hàm commit.
 */
interface CommitFilesOptions {
	/**
	 * Tên tổ chức GitHub.
	 */
	orgName: string
	/**
	 * Tên repo.
	 */
	repoName: string
	/**
	 * Mô tả của commit.
	 */
	message: string
	/**
	 * Các tập tin thêm vào commit.
	 */
	addedFiles?: AddedCommitFile[]
	/**
	 * Các đường dẫn tập tin cần xóa khi commit.
	 */
	deletedPaths?: string[]
}

/**
 * Commit thêm, xóa các tập tin và đẩy lên GitHub.
 *
 * @returns Một mảng chứa SHA của các tập tin đã thêm.
 */
export async function commitAndPushFiles(
	rest: Octokit,
	{ orgName, repoName, message, addedFiles = [], deletedPaths = [] }: CommitFilesOptions
): Promise<string[]> {
	let res: any

	// Dừng lại nếu không có gì thay đổi.
	if (addedFiles.length === 0 && deletedPaths.length === 0) return []

	// Lấy SHA commit mới nhất trên GitHub.
	res = await rest.repos.getCommit({
		owner: orgName,
		repo: repoName,
		ref: 'heads/main'
	})
	const commitSHA = res.data.sha

	// Tạo mảng SHA các tập tin cần thêm vào.
	const addedFileSHAs: string[] = []
	for (const file of addedFiles) {
		res = await rest.git.createBlob({
			owner: orgName,
			repo: repoName,
			encoding: 'base64',
			content: file.content
		})
		const blobSHA = res.data.sha
		addedFileSHAs.push(blobSHA)
	}

	// Tạo một tree gồm các thay đổi và lấy tree SHA.
	res = await rest.git.createTree({
		owner: orgName,
		repo: repoName,
		base_tree: commitSHA,
		tree: [
			...(addedFiles.map((file, i) => ({
				path: file.path,
				mode: '100644',
				type: 'commit',
				sha: addedFileSHAs[i]
			})) as Tree),
			...(deletedPaths.map((path) => ({
				path,
				mode: '100644',
				type: 'commit',
				sha: null
			})) as Tree)
		]
	})
	const treeSHA = res.data.sha

	// Tạo một commit và lấy commit SHA.
	res = await rest.git.createCommit({
		owner: orgName,
		repo: repoName,
		tree: treeSHA,
		parents: [commitSHA],
		message
	})
	const newCommitSHA = res.data.sha

	// Đẩy commit lên GitHub.
	res = await rest.git.updateRef({
		owner: orgName,
		repo: repoName,
		ref: 'heads/main',
		sha: newCommitSHA
	})

	return addedFileSHAs
}
