import { Entity, EntityTypes } from '../../store/slices/settingsSlice'
import { useStore } from '../../store/useStore'
import { Monaco } from './types'

const emojis: [string, string[]][] = [
	[':)', ['🙂', '😌']],
	[':D', ['😄', '😅', '😁', '😬', '😀']],
	['xD', ['😆', '😂']],
	[':(', ['☹️', '😟', '😞']],
	[":'(", ['😢', '🥹', '🥺']],
	['TT', ['😭']],
	['>:(', ['😠', '😡']],
	['D:', ['😨', '😧']],
	['Dx', ['😫', '😩']],
	['^^', ['😚', '🤭']],
	[':*', ['😘']],
	[';)', ['😉']],
	[':p', ['😛']],
	[':/', ['😕']],
	[':?', ['🤔', '🤨']],
	[':M', ['😗']],
	[':l', ['😐', '😑', '😳', '😶']],
	[':o', ['😮', '😯', '😱']],
	[':x', ['🤢']],
	['0:)', ['😇']],
	['3:)', ['😈']],
	[':J', ['😏']],
	['B)', ['😎']],
	['xx', ['😵']],
	['@@', ['😵‍💫']],
	['><', ['😣', '😖']],
	['>>', ['🙄', '😒']],
	['zzz', ['😴', '😪', '🥱']],
	['<3', ['❤️']],
	['</3', ['💔']]
]

export function registerCompletionItemProvider(): Monaco.IDisposable {
	const store = useStore.getState()
	const monaco: typeof Monaco = store.monaco!
	const entities: Entity[] = store.entities

	const disposer: Monaco.IDisposable = monaco.languages.registerCompletionItemProvider('diori', {
		provideCompletionItems(model, position) {
			const wordPosition = model.getWordUntilPosition(position)
			const range = new monaco.Range(
				position.lineNumber,
				wordPosition.startColumn,
				position.lineNumber,
				wordPosition.endColumn
			)
			const range2 = range.setEndPosition(range.endLineNumber, range.endColumn - 1)
			const suggestions = entities.map<Monaco.languages.CompletionItem>((entity) => {
				const isPerson: boolean = entity.type === EntityTypes.PERSON
				return {
					label: entity.name,
					insertText: entity.name,
					kind: isPerson
						? monaco.languages.CompletionItemKind.Enum
						: monaco.languages.CompletionItemKind.Method,
					detail: entity.description,
					range
				}
			})
			for (const emoji of emojis) {
				for (const insertText of emoji[1]) {
					suggestions.push({
						label: emoji[0],
						insertText,
						kind: monaco.languages.CompletionItemKind.Variable,
						detail: insertText,
						range: range2
					})
				}
			}
			return { suggestions }
		},
		triggerCharacters: [':']
	})

	return disposer
}
