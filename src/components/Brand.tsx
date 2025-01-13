import { ReactNode } from 'react'
import { version } from '../../package.json'

export function Brand(): ReactNode {
	return (
		<div className="flex gap-1 text-base">
			<div className="font-semibold">Diori</div>
			<div className="text-zinc-400 light:text-zinc-500">{version}</div>
		</div>
	)
}
