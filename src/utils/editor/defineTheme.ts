import { useStore } from '../../store/useStore'
import { Monaco } from '../../types/monaco'

export function defineTheme(): void {
	const monaco: typeof Monaco = useStore.getState().monaco!

	monaco.editor.defineTheme('diori-dark', {
		base: 'vs-dark',
		inherit: true,
		colors: {
			'editor.background': '#18181b',
			'editor.foreground': '#fafafa',
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
				foreground: '#6a7a91'
			},
			{
				token: 'gray-italic',
				foreground: '#6a7a91',
				fontStyle: 'italic'
			},
			{
				token: 'red',
				foreground: '#ff5874'
			},
			{
				token: 'red-italic',
				foreground: '#ff5874',
				fontStyle: 'italic bold'
			},
			{
				token: 'orange',
				foreground: '#e78c70'
			},
			{
				token: 'orange-italic',
				foreground: '#e78c70',
				fontStyle: 'italic bold'
			},
			{
				token: 'teal',
				foreground: '#14b8a6'
			},
			{
				token: 'teal-italic',
				foreground: '#14b8a6',
				fontStyle: 'italic bold'
			},
			{
				token: 'blue',
				foreground: '#77a6ff'
			},
			{
				token: 'blue-italic',
				foreground: '#77a6ff',
				fontStyle: 'italic bold'
			},
			{
				token: 'purple',
				foreground: '#c792ea'
			},
			{
				token: 'purple-italic',
				foreground: '#c792ea',
				fontStyle: 'italic bold'
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
