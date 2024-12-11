import { ReactNode } from 'react'
import pkg from '../../package.json'

export function Brand(): ReactNode {
	return (
		<div className="flex gap-1 text-base">
			<div className="font-semibold">Diori</div>
			<div className="text-zinc-400 light:text-zinc-500">{pkg.version}</div>
		</div>
	)
}
