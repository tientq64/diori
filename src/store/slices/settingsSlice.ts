import { findIndex, remove } from 'lodash'
import { SliceCreator } from '../useStore'

/**
 * Kiểu của đối tượng.
 */
export enum EntityTypes {
	/** Tên người. */
	PERSON = 'person',
	/** Danh từ riêng. */
	PROPER_NOUN = 'properNoun'
}

/**
 * Đối tượng. Đối tượng có thể là tên người, hoặc danh từ riêng. Dùng trong tô sáng cú pháp khi viết nhật ký.
 */
export type Entity = {
	id: number
	type: EntityTypes
	name: string
	aliasNames: string[]
	description: string
}

/**
 * Các thuộc tính của cài đặt.
 */
export type SettingsProps = {
	/** Phông chữ. */
	fontFamily: string
	/** Cỡ chữ. */
	fontSize: number
	/** Chế độ tối. */
	isDarkMode: boolean
	/** Các đối tượng. */
	entities: Entity[]
}

export type Settings = SettingsProps & {
	setFontFamily: (fontFamily: string) => void
	setFontSize: (fontSize: number) => void
	setIsDarkMode: (isDarkMode: boolean) => void
	setEntities: (entities: Entity[]) => void
	/**
	 * Thêm mới hoặc cập nhật đối tượng.
	 */
	addOrUpdateEntity: (entity: Entity) => void
	removeEntity: (entity?: Entity) => void
	/**
	 * Trả về các thuộc tính của cài đặt.
	 */
	getSettingsProps: () => SettingsProps
	setSettingsProps: (settingsProps: SettingsProps) => void
}

export const settingsSlice: SliceCreator<Settings> = (set, get) => ({
	fontFamily: 'Arial',
	fontSize: 16,
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

	getSettingsProps: (): SettingsProps => {
		const state = get()
		return {
			fontFamily: state.fontFamily,
			fontSize: state.fontSize,
			isDarkMode: state.isDarkMode,
			entities: state.entities
		}
	},

	setSettingsProps: (settingsProps) => {
		set({
			fontFamily: settingsProps.fontFamily,
			fontSize: settingsProps.fontSize,
			isDarkMode: settingsProps.isDarkMode,
			entities: settingsProps.entities
		})
	}
})
