import { RestEndpointMethodTypes } from '@octokit/rest'

export type ReposGetCommitResponse = RestEndpointMethodTypes['repos']['getCommit']['response']
export type GitGetTreeResponse = RestEndpointMethodTypes['git']['getTree']['response']
export type GitGetBlobResponse = RestEndpointMethodTypes['git']['getBlob']['response']
