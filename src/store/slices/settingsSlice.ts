import { findIndex, remove } from 'lodash'
import { SliceCreator } from '../useStore'

/**
 * Kiểu của đối tượng.
 */
export enum EntityTypes {
	/**
	 * Tên người.
	 */
	PERSON = 'person',
	/**
	 * Danh từ riêng.
	 */
	PROPER_NOUN = 'properNoun'
}

/**
 * Đối tượng. Đối tượng có thể là tên người, hoặc danh từ riêng.
 * Dùng trong tô sáng cú pháp khi viết nhật ký.
 */
export interface Entity {
	/**
	 * ID của đối tượng.
	 */
	id: number
	/**
	 * Kiểu của đối tượng.
	 */
	type: EntityTypes
	/**
	 * Tên đối tượng.
	 */
	name: string
	/**
	 * Các tên tương tự khác.
	 */
	aliasNames: string[]
	/**
	 * Mô tả đối tượng.
	 */
	description: string
}

/**
 * Các thuộc tính của cài đặt.
 */
export interface SettingsProps {
	/**
	 * Phông chữ.
	 */
	fontFamily: string
	/**
	 * Cỡ chữ.
	 */
	fontSize: number
	/**
	 * Chế độ tối.
	 */
	isDarkMode: boolean
	/**
	 * Các đối tượng.
	 */
	entities: Entity[]
}

export interface Settings extends SettingsProps {
	setFontFamily: (fontFamily: string) => void
	setFontSize: (fontSize: number) => void
	setIsDarkMode: (isDarkMode: boolean) => void
	setEntities: (entities: Entity[]) => void
	/**
	 * Thêm mới hoặc cập nhật đối tượng.
	 */
	addOrUpdateEntity: (entity: Entity) => void
	/**
	 * Loại bỏ một đối tượng.
	 * @param entity Đối tượng cần loại bỏ.
	 */
	removeEntity: (entity?: Entity) => void
	/**
	 * Trả về tất cả cài đặt hiện tại.
	 */
	getSettingsProps: () => SettingsProps
	/**
	 * Cập nhật tất cả cài đặt.
	 * @param settingsProps Tất cả các thuộc tính của cài đặt.
	 */
	setSettingsProps: (settingsProps: SettingsProps) => void
}

export const settingsSlice: SliceCreator<Settings> = (set, get) => ({
	fontFamily: 'Arial',
	fontSize: 16,
	isDarkMode: true,
	entities: [],

	setFontFamily: (fontFamily) => set({ fontFamily }),
	setFontSize: (fontSize) => set({ fontSize }),
	setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
	setEntities: (entities) => set({ entities }),

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
		if (entity === undefined) return
		set((state) => {
			remove(state.entities, { id: entity.id })
		})
	},

	getSettingsProps: () => {
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
