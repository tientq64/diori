import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { Monaco } from '../types/monaco'

export function useEditorOptions(): Monaco.editor.IStandaloneEditorConstructionOptions {
	const isMd = useStore((state) => state.isMd)
	const fontFamily = useStore((state) => state.fontFamily)
	const fontSize = useStore((state) => state.fontSize)

	const editorOptions = useMemo<Monaco.editor.IStandaloneEditorConstructionOptions>(
		() => ({
			fontFamily: fontFamily,
			fontSize: fontSize,
			wordWrap: isMd ? 'bounded' : 'on',
			wordWrapColumn: 160,
			wrappingStrategy: 'advanced',
			lineNumbers: 'off',
			lineDecorationsWidth: 0,
			insertSpaces: false,
			smoothScrolling: true,
			automaticLayout: true,
			renderLineHighlightOnlyWhenFocus: true,
			rulers: isMd ? [164] : undefined,
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
