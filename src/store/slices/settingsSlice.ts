import { SliceCreator } from '../useStore'

export type Settings = {
	isDarkMode: boolean

	setIsDarkMode: (isDarkMode: boolean) => void
}

export const settingsSlice: SliceCreator<Settings> = (set) => ({
	isDarkMode: false,

	setIsDarkMode: (isDarkMode) => {
		set({ isDarkMode })
	}
})
