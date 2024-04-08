import { findIndex } from 'lodash'
import { SliceCreator } from '../useStore'

export type Person = {
	id: number
	name: string
	aliasNames: string[]
	description: string
}

export type ProperNoun = {
	id: string
	name: string
	aliasNames: string[]
	description: string
}

export type Settings = {
	fontFamily: string
	fontSize: number
	isDarkMode: boolean
	persons: Person[]
	properNouns: ProperNoun[]

	setFontFamily: (fontFamily: string) => void
	setFontSize: (fontSize: number) => void
	setIsDarkMode: (isDarkMode: boolean) => void
	setPersons: (persons: Person[]) => void
	addOrUpdatePerson: (person: Person) => void
	setProperNouns: (properNouns: ProperNoun[]) => void
	getSettingsJSON: () => Partial<Settings>
}

export const settingsSlice: SliceCreator<Settings> = (set, get) => ({
	fontFamily: 'Arial',
	fontSize: 13,
	isDarkMode: false,
	persons: [],
	properNouns: [],

	setFontFamily: (fontFamily) => {
		set({ fontFamily })
	},

	setFontSize: (fontSize) => {
		set({ fontSize })
	},

	setIsDarkMode: (isDarkMode) => {
		set({ isDarkMode })
	},

	setPersons: (persons) => {
		set({ persons })
	},

	addOrUpdatePerson: (person) => {
		set((state) => {
			const index = findIndex(state.persons, { id: person.id })
			if (index === -1) {
				state.persons.push(person)
			} else {
				state.persons[index] = person
			}
		})
	},

	setProperNouns: (properNouns) => {
		set({ properNouns })
	},

	getSettingsJSON: () => {
		const state = get()
		return {
			fontFamily: state.fontFamily,
			fontSize: state.fontSize,
			isDarkMode: state.isDarkMode,
			persons: state.persons,
			properNouns: state.properNouns
		}
	}
})
