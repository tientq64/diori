import { useStore } from '../../store/useStore'
import { defineTheme } from './defineTheme'
import { registerCompletionItemProvider } from './registerCompletionItemProvider'
import { registerHoverProvider } from './registerHoverProvider'
import { registerLinkProvider } from './registerLinkProvider'
import { setLanguageConfiguration } from './setLanguageConfiguration'
import { setMonarchTokensProvider } from './setMonarchTokensProvider'
import { Monaco } from './types'

export const setupEditor = (): Monaco.IDisposable => {
	const monaco: typeof Monaco = useStore.getState().monaco!

	monaco.languages.register({ id: 'diori' })

	const monarchTokensDisposer: Monaco.IDisposable = setMonarchTokensProvider()
	const languageConfigurationDisposer: Monaco.IDisposable = setLanguageConfiguration()
	const completionItemDisposer: Monaco.IDisposable = registerCompletionItemProvider()
	const linkDisposer: Monaco.IDisposable = registerLinkProvider()
	const hoverDisposer: Monaco.IDisposable = registerHoverProvider()

	defineTheme()

	return {
		dispose: (): void => {
			monarchTokensDisposer.dispose()
			languageConfigurationDisposer.dispose()
			completionItemDisposer.dispose()
			linkDisposer.dispose()
			hoverDisposer.dispose()
		}
	}
}
