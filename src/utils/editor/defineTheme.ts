import { useStore } from '../../store/useStore'
import { Monaco } from './types'

export function defineTheme(): void {
	const monaco: typeof Monaco = useStore.getState().monaco!

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
}
