import { findIndex, remove } from 'lodash'
import { SliceCreator } from '../useStore'

export enum EntityTypes {
	PERSON = 'person',
	PROPER_NOUN = 'properNoun'
}

export type Entity = {
	id: number
	type: EntityTypes
	name: string
	aliasNames: string[]
	description: string
}

export type Settings = {
	fontFamily: string
	fontSize: number
	isDarkMode: boolean
	entities: Entity[]

	setFontFamily: (fontFamily: string) => void
	setFontSize: (fontSize: number) => void
	setIsDarkMode: (isDarkMode: boolean) => void
	setEntities: (entities: Entity[]) => void
	addOrUpdateEntity: (entity: Entity) => void
	removeEntity: (entity?: Entity) => void
	getSettingsJSON: () => Partial<Settings>
}

export const settingsSlice: SliceCreator<Settings> = (set, get) => ({
	fontFamily: 'Arial',
	fontSize: 14,
	isDarkMode: true,
	entities: [],

	setFontFamily: (fontFamily) => {
		set({ fontFamily })
	},

	setFontSize: (fontSize) => {
		set({ fontSize })
	},

	setIsDarkMode: (isDarkMode) => {
		set({ isDarkMode })
	},

	setEntities: (entities) => {
		set({ entities })
	},

	addOrUpdateEntity: (entity) => {
		set((state) => {
			const index = findIndex(state.entities, { id: entity.id })
			if (index === -1) {
				state.entities.push(entity)
			} else {
				state.entities[index] = entity
			}
		})
	},

	removeEntity: (entity) => {
		if (!entity) return
		set((state) => {
			remove(state.entities, { id: entity.id })
		})
	},

	getSettingsJSON: () => {
		const state = get()
		return {
			fontFamily: state.fontFamily,
			fontSize: state.fontSize,
			isDarkMode: state.isDarkMode,
			entities: state.entities
		}
	}
})
