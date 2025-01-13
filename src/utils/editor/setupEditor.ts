import { useAppStore } from '../../store/useAppStore'
import { Monaco } from '../../types/monaco'
import { defineTheme } from './defineTheme'
import { registerCompletionItemProvider } from './registerCompletionItemProvider'
import { registerHoverProvider } from './registerHoverProvider'
import { registerLinkProvider } from './registerLinkProvider'
import { setLanguageConfiguration } from './setLanguageConfiguration'
import { setMonarchTokensProvider } from './setMonarchTokensProvider'

export function setupEditor(): Monaco.IDisposable {
	const monaco: typeof Monaco | null = useAppStore.getState().monaco

	if (monaco === null) {
		throw Error('Trình soạn thảo chưa được khởi tạo trong khi setup')
	}
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
