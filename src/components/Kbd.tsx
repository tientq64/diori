import { ReactNode } from 'react'

type KbdProps = {
	children: ReactNode
}

export function Kbd({ children }: KbdProps): ReactNode {
	return (
		<kbd
			className="inline-block px-1 rounded border-b-2 border-zinc-500 light:border-zinc-900 bg-zinc-700
			text-xs text-zinc-300 -translate-y-px"
		>
			{children}
		</kbd>
	)
}
