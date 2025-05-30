import { findIndex, some } from 'lodash'
import { Entity } from '../../store/slices/settingsSlice'
import { AppStore, useAppStore } from '../../store/useAppStore'
import { Monaco } from '../../types/monaco'
import { getEntityNameWithoutNote } from '../getEntityNameWithoutNote'
import { Position, Range } from 'monaco-editor'

interface FlatEntity extends Entity {
	nameWithNote?: string
	isUnknown?: boolean
}

export function registerHoverProvider(): Monaco.IDisposable {
	const store: AppStore = useAppStore.getState()
	const monaco: typeof Monaco = store.monaco!
	const entities: Entity[] = store.entities

	const disposer: Monaco.IDisposable = monaco.languages.registerHoverProvider('diori', {
		provideHover(model, position) {
			const lineContent: string = model.getLineContent(position.lineNumber)
			if (lineContent.trim().length === 0) return null

			const existedFlatEntities: Record<string, Entity | undefined> = {}

			const flatEntities: FlatEntity[] = structuredClone(entities)
				.flatMap((entity) => {
					const nameWithoutNote: string = getEntityNameWithoutNote(entity.name)
					const subFlatEntities: FlatEntity[] = [
						entity,
						...entity.aliasNames.map<Entity>((aliasName) => ({
							...entity,
							name: aliasName,
							nameWithNote: entity.name
						}))
					]
					if (nameWithoutNote !== entity.name) {
						const hasEntityHasNameWithoutNote: boolean = some(entities, {
							name: nameWithoutNote
						})
						const existedFlatEntity: FlatEntity | undefined =
							existedFlatEntities[nameWithoutNote]
						if (!hasEntityHasNameWithoutNote) {
							if (existedFlatEntity === undefined) {
								const subFlatEntity: FlatEntity = {
									...entity,
									name: nameWithoutNote,
									nameWithNote: entity.name,
									isUnknown: true
								}
								subFlatEntities.push(subFlatEntity)
								existedFlatEntities[nameWithoutNote] = entity
							}
						}
					}
					return subFlatEntities
				})
				.toSorted((entityA, entityB) => {
					return entityB.name.length - entityA.name.length
				})

			let currentIndex: number = 0
			eating: while (true) {
				for (const entity of flatEntities) {
					const behindChar: string | undefined = lineContent.at(
						currentIndex + entity.name.length
					)
					if (
						behindChar !== undefined &&
						/\p{L}|[^\s.,:;!?)\]}]/u.test(behindChar)
					)
						continue
					if (lineContent.startsWith(entity.name, currentIndex)) {
						if (!entity.isUnknown) {
							const nameWithoutNote: string = getEntityNameWithoutNote(
								entity.name
							)
							if (entity.name !== nameWithoutNote) {
								const index: number = findIndex(flatEntities, {
									name: nameWithoutNote
								})
								flatEntities[index] = {
									...entity,
									name: nameWithoutNote,
									nameWithNote: entity.name
								}
							}
						}
						const start: Monaco.Position = new Position(
							position.lineNumber,
							currentIndex + 1
						)
						if (position.isBefore(start)) {
							break eating
						}
						const end: Monaco.Position = start.delta(0, entity.name.length)
						const range: Monaco.Range = Range.fromPositions(start, end)
						if (range.containsPosition(position)) {
							return {
								contents: [
									{
										value: entity.nameWithNote ?? entity.name
									},
									{
										value: entity.description
									}
								],
								range
							}
						}
						currentIndex += entity.name.length
						break
					}
				}
				currentIndex = lineContent.indexOf(' ', currentIndex)
				if (currentIndex === -1) break
				currentIndex += 1
			}
		}
	})

	return disposer
}
