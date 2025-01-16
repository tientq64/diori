import { ReactNode } from 'react'
import { repository, version } from '../../package.json'
import { Link2 } from './Link2'

export function Brand(): ReactNode {
	return (
		<Link2 className="flex gap-1 text-base" href={repository.url}>
			<div className="font-semibold">Diori</div>
			<div className="text-zinc-400 light:text-zinc-500">{version}</div>
		</Link2>
	)
}
