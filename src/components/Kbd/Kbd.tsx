import { ReactNode } from 'react'

type KbdProps = {
	children: ReactNode
}

export function Kbd({ children }: KbdProps) {
	return (
		<kbd
			className="inline-block px-1 rounded border-b-2 border-neutral-900 dark:border-neutral-500 bg-neutral-700
			text-xs text-neutral-300 -translate-y-px"
		>
			{children}
		</kbd>
	)
}
