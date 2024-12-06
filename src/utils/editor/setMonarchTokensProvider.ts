import { IDisposable } from 'monaco-editor'
import { Entity, EntityTypes } from '../../store/slices/settingsSlice'
import { Store, useStore } from '../../store/useStore'
import { getEntityNameWithoutNote } from '../getEntityNameWithoutNote'
import { Monaco } from './types'

export function setMonarchTokensProvider(): Monaco.IDisposable {
	const store: Store = useStore.getState()
	const monaco: typeof Monaco = store.monaco!
	const entities: Entity[] = store.entities

	const regexes: Record<string, RegExp> = {}

	for (const type of Object.values(EntityTypes)) {
		const names: string[] = entities
			.filter((entity) => entity.type === type)
			.flatMap((entity) => {
				let names: string[] = entity.aliasNames
					.concat(entity.name)
					.map((name) => getEntityNameWithoutNote(name))
				names = [...new Set(names)]
				return names
			})
			.toSorted((nameA, nameB) => nameB.length - nameA.length)
		const regex: RegExp = names.length
			? RegExp(`(?:${names.join('|')})(?=[\\s.,:;!?)\\]}]|$)`)
			: /~^/
		regexes[type] = regex
	}

	const disposer: IDisposable = monaco.languages.setMonarchTokensProvider('diori', {
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
					regex: /(\d+(\.\d+)?(tr|[klpt%])?)(?=[\s.,:;!?)\]}]|$)/,
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
					include: '@link'
				},
				{
					regex: /[\p{L}\d]+/u
				}
			],
			link: [
				{
					regex: /(\[)(.+?)(\])(\[.+?\])/,
					action: ['aqua', 'aqua-italic', 'aqua', 'gray']
				}
			],
			note: [
				{
					include: '@link'
				},
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
					include: '@link'
				},
				{
					regex: /.+?/,
					action: { token: 'green-italic' }
				}
			],
			emotions: [
				{
					regex: /:["']?[()]+|:["']?>|:[D30v]|[;=]\)+|'v'/,
					action: 'yellow'
				},
				{
					regex: /[\p{Emoji_Presentation}]/u,
					action: 'yellow'
				}
			]
		},
		unicode: true
	})

	return disposer
}
