import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { EditorOptions } from '../types/monaco'

export function useEditorOptions(): EditorOptions {
	const isMd = useAppStore((state) => state.isMd)
	const fontFamily = useAppStore((state) => state.fontFamily)
	const fontSize = useAppStore((state) => state.fontSize)

	const editorOptions = useMemo<EditorOptions>(
		() => ({
			fontFamily,
			fontSize,
			wordWrap: isMd ? 'bounded' : 'on',
			wordWrapColumn: 160,
			wrappingStrategy: 'advanced',
			lineNumbers: 'on',
			lineDecorationsWidth: 16,
			insertSpaces: false,
			smoothScrolling: true,
			automaticLayout: true,
			renderLineHighlightOnlyWhenFocus: true,
			rulers: isMd ? [168] : undefined,
			padding: {
				top: 12
			},
			minimap: {
				enabled: isMd,
				renderCharacters: false,
				maxColumn: 400
			},
			stickyScroll: {
				enabled: false
			}
		}),
		[fontFamily, fontSize, isMd]
	)
	return editorOptions
}
