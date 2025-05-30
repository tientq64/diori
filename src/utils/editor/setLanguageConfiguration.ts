import { useAppStore } from '../../store/useAppStore'
import { Monaco } from '../../types/monaco'

export function setLanguageConfiguration(): Monaco.IDisposable {
	const monaco = useAppStore.getState().monaco!

	const disposer: Monaco.IDisposable = monaco.languages.setLanguageConfiguration(
		'diori',
		{
			autoClosingPairs: [
				{ open: '(', close: ')' },
				{ open: '[', close: ']' },
				{ open: '{', close: '}' },
				{ open: '"', close: '"' }
			]
		}
	)

	return disposer
}
