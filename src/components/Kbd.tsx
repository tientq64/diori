import { ReactNode } from 'react'

type KbdProps = {
	children: ReactNode
}

export function Kbd({ children }: KbdProps): ReactNode {
	return (
		<kbd className="inline-block -translate-y-px rounded border-b-2 border-zinc-500 bg-zinc-700 px-1 text-xs text-zinc-300 light:border-zinc-900">
			{children}
		</kbd>
	)
}
