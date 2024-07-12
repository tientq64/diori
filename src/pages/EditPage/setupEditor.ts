import type * as Monaco from 'monaco-editor'
import { Entity, EntityTypes } from '../../store/slices/settingsSlice'

type SetupEditorOptions = {
	entities: Entity[]
	persons: Entity[]
	properNouns: Entity[]
}

export const setupEditor = (
	monaco: typeof Monaco,
	{ entities, persons, properNouns }: SetupEditorOptions
): Monaco.IDisposable => {
	monaco.languages.register({ id: 'diori' })

	const groups: Record<string, Entity[]> = {
		person: persons,
		properNoun: properNouns
	}
	const regexes: Record<string, RegExp> = {}
	for (const type of Object.values(EntityTypes)) {
		const names: string[] = groups[type]
			.flatMap((entity) => {
				const names = entity.aliasNames
					.concat(entity.name)
					.map((name) => name.replace(/ \(.*\)$/, ''))
				return names
			})
			.toSorted((nameA, nameB) => nameB.length - nameA.length)
		const regex: RegExp = names.length
			? RegExp(`(?:${names.join('|')})(?=[\\s.,:;!?)\\]}]|$)`)
			: /~^/
		regexes[type] = regex
	}

	const monarchTokensDisposer: Monaco.IDisposable = monaco.languages.setMonarchTokensProvider(
		'diori',
		{
			tokenizer: {
				root: [
					{
						// Trích dẫn, lời nói.
						regex: /"/,
						action: { token: 'green-italic', next: '@quote' }
					},
					{
						// Chú thích.
						regex: /\(/,
						action: { token: 'gray', next: '@note' }
					},
					{
						// Chi tiết link.
						regex: /^(\[.+?\])(: *)([^"\n]+?)((?: *".+?")?)$/,
						action: ['gray', 'gray', 'aqua-italic', 'green-italic']
					},
					{
						// Link.
						regex: /(\[)(.+?)(\])(\[.+?\])/,
						action: ['aqua', 'aqua-italic', 'aqua', 'gray']
					},
					{
						// Giờ phút.
						regex: /(([01]\d|2[0-3]):[0-5]\d|24:00|\d+h([0-5]\d)?)(?=[\s.,:;!?)\]}]|$)/,
						action: 'red-italic'
					},
					{
						// Ngày tháng năm.
						regex: /((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[012])\/[12]\d{3})(?=[\s.,:;!?)\]}]|$)/,
						action: 'red-italic'
					},
					{
						// Ngày tháng, năm.
						regex: /(((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[012]))|[12]\d{3})(?=[\s.,:;!?)\]}]|$)/,
						action: 'red-italic'
					},
					{
						// Tỷ số bóng đá.
						regex: /(\d+-\d+)(?=[\s.,:;!?)\]}]|$)/,
						action: 'orange-italic'
					},
					{
						// Đơn vị, số.
						regex: /(\d+(tr|[kpt%])|\d+)(?=[\s.,:;!?)\]}]|$)/,
						action: 'orange-italic'
					},
					{
						// Tên riêng.
						regex: regexes[EntityTypes.PROPER_NOUN],
						action: 'purple-italic'
					},
					{
						// Tên người.
						regex: regexes[EntityTypes.PERSON],
						action: 'blue-italic'
					},
					{
						include: '@emotions'
					},
					{
						regex: /[\p{L}\d]+/u
					}
				],
				note: [
					{
						include: '@emotions'
					},
					{
						regex: /\)/,
						action: { token: 'gray', next: '@pop' }
					},
					{
						regex: /\(/,
						action: { token: 'gray', next: '@push' }
					},
					{
						regex: /.+?/,
						action: { token: 'gray-italic' }
					}
				],
				quote: [
					{
						regex: /"/,
						action: { token: 'green-italic', next: '@pop' }
					},
					{
						regex: /.+?/,
						action: { token: 'green-italic' }
					}
				],
				emotions: [
					{
						regex: /:["']?[()]+|:["']?>|:[D3v]|[;=]\)+/,
						action: 'yellow'
					},
					{
						regex: /[\p{Emoji_Presentation}]/u,
						action: 'yellow'
					}
				]
			},
			unicode: true
		}
	)

	const languageConfigurationDisposer: Monaco.IDisposable =
		monaco.languages.setLanguageConfiguration('diori', {
			autoClosingPairs: [
				{ open: '(', close: ')' },
				{ open: '[', close: ']' },
				{ open: '{', close: '}' },
				{ open: '"', close: '"' }
			]
		})

	const completionItemDisposer: Monaco.IDisposable =
		monaco.languages.registerCompletionItemProvider('diori', {
			provideCompletionItems(model, position) {
				const wordPosition = model.getWordUntilPosition(position)
				const range = new monaco.Range(
					position.lineNumber,
					wordPosition.startColumn,
					position.lineNumber,
					wordPosition.endColumn
				)
				const suggestions = entities.map<Monaco.languages.CompletionItem>((entity) => {
					return {
						label: entity.name,
						insertText: entity.name,
						kind: monaco.languages.CompletionItemKind.User,
						documentation: entity.description,
						range
					}
				})
				return { suggestions }
			}
		})

	const linkDisposer: Monaco.IDisposable = monaco.languages.registerLinkProvider('diori', {
		provideLinks(model) {
			const value = model.getValue()
			let iterator

			const links: Record<string, string[]> = {}
			iterator = value.matchAll(/^\[(.+?)\]: *([^"\n]+?)(?: *"(.+?)")?$/gm)
			for (const item of iterator) {
				links[item[1]] = [item[1], item[2], item[3]]
			}

			const editorLinks: Monaco.languages.ILink[] = []
			iterator = value.matchAll(/\[.+?\]\[(.+?)\]/dg)
			for (const item of iterator) {
				const link = links[item[1]]
				if (!link) continue
				const [start, end] = item.indices![0]
				const startPosition = model.getPositionAt(start)
				const endPosition = model.getPositionAt(end - item[1].length - 2)
				const editorLink: Monaco.languages.ILink = {
					range: new monaco.Range(
						startPosition.lineNumber,
						startPosition.column,
						endPosition.lineNumber,
						endPosition.column
					),
					url: link[1],
					tooltip: (link[2] ? `${link[2]} \u2013 ` : '') + link[1]
				}
				editorLinks.push(editorLink)
			}
			return {
				links: editorLinks
			}
		}
	})

	monaco.editor.defineTheme('diori-dark', {
		base: 'vs-dark',
		inherit: true,
		colors: {
			'editor.background': '#18181b',
			'editor.foreground': '#e6e6e6',
			'editor.findMatchBorder': '#ffcb6b',
			'editor.findMatchHighlightBackground': '#ffcb6b66'
		},
		rules: [
			{
				token: 'green',
				foreground: '#c3e88d'
			},
			{
				token: 'green-italic',
				foreground: '#c3e88d',
				fontStyle: 'italic'
			},
			{
				token: 'gray',
				foreground: '#697098'
			},
			{
				token: 'gray-italic',
				foreground: '#697098',
				fontStyle: 'italic'
			},
			{
				token: 'red',
				foreground: '#ff5874'
			},
			{
				token: 'red-italic',
				foreground: '#ff5874',
				fontStyle: 'italic'
			},
			{
				token: 'orange',
				foreground: '#f78c6c'
			},
			{
				token: 'orange-italic',
				foreground: '#f78c6c',
				fontStyle: 'italic'
			},
			{
				token: 'blue',
				foreground: '#7986e7'
			},
			{
				token: 'blue-italic',
				foreground: '#7986e7',
				fontStyle: 'italic'
			},
			{
				token: 'purple',
				foreground: '#c792ea'
			},
			{
				token: 'purple-italic',
				foreground: '#c792ea',
				fontStyle: 'italic'
			},
			{
				token: 'aqua',
				foreground: '#89ddff'
			},
			{
				token: 'aqua-italic',
				foreground: '#89ddff',
				fontStyle: 'italic'
			},
			{
				token: 'yellow',
				foreground: '#ffcb6b'
			},
			{
				token: 'yellow-italic',
				foreground: '#ffcb6b',
				fontStyle: 'italic'
			}
		]
	})

	return {
		dispose: (): void => {
			monarchTokensDisposer.dispose()
			languageConfigurationDisposer.dispose()
			completionItemDisposer.dispose()
			linkDisposer.dispose()
		}
	}
}
