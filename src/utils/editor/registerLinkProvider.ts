import { useAppStore } from '../../store/useAppStore'
import { Monaco } from '../../types/monaco'

export function registerLinkProvider(): Monaco.IDisposable {
	const monaco: typeof Monaco = useAppStore.getState().monaco!

	const disposer: Monaco.IDisposable = monaco.languages.registerLinkProvider('diori', {
		provideLinks(model) {
			const value: string = model.getValue()
			let iterator: RegExpStringIterator<RegExpExecArray>

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

	return disposer
}
