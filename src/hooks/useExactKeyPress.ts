import { useKeyPress } from 'ahooks'
import { KeyFilter, KeyType, Options } from 'ahooks/lib/useKeyPress'

export function useExactKeyPress(
	keyFilter: KeyFilter,
	eventHandler: (event: KeyboardEvent, key: KeyType) => void,
	option?: Omit<Options, 'exactMatch'> | undefined
) {
	return useKeyPress(keyFilter, eventHandler, {
		...option,
		exactMatch: true
	})
}
