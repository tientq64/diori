import { useStore } from '../../store/useStore'
import { Monaco } from './types'

export function setLanguageConfiguration(): Monaco.IDisposable {
	const monaco = useStore.getState().monaco!

	const disposer: Monaco.IDisposable = monaco.languages.setLanguageConfiguration('diori', {
		autoClosingPairs: [
			{ open: '(', close: ')' },
			{ open: '[', close: ']' },
			{ open: '{', close: '}' },
			{ open: '"', close: '"' }
		]
	})

	return disposer
}
