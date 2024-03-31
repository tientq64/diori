import { SliceCreator } from '../useStore'

export type Settings = {
	fontFamily: string
	fontSize: number
	isDarkMode: boolean

	setFontFamily: (fontFamily: string) => void
	setFontSize: (fontSize: number) => void
	setIsDarkMode: (isDarkMode: boolean) => void
}

export const settingsSlice: SliceCreator<Settings> = (set) => ({
	fontFamily: 'Arial',
	fontSize: 13,
	isDarkMode: false,

	setFontFamily: (fontFamily) => {
		set({ fontFamily })
	},

	setFontSize: (fontSize) => {
		set({ fontSize })
	},

	setIsDarkMode: (isDarkMode) => {
		set({ isDarkMode })
	}
})
