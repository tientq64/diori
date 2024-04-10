import { mountStoreDevtool } from 'simple-zustand-devtools'
import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Diary, diarySlice } from './slices/diarySlice'
import { Editing, editingSlice } from './slices/editingSlice'
import { Settings, settingsSlice } from './slices/settingsSlice'
import { User, userSlice } from './slices/userSlice'

export type SliceCreator<T> = StateCreator<Store, [['zustand/immer', never]], [], T>

export type Store = User & Settings & Diary & Editing

const store: StateCreator<Store> = (...args) => ({
	...userSlice(...args),
	...settingsSlice(...args),
	...diarySlice(...args),
	...editingSlice(...args)
})

export const useStore = create<Store>()(
	immer(
		persist(store, {
			name: 'diori:store',

			partialize: (state) => ({
				orgName: state.orgName,
				encryptedToken: state.encryptedToken,
				fontFamily: state.fontFamily,
				fontSize: state.fontSize,
				isDarkMode: state.isDarkMode,
				persons: state.properNoun,
				properNouns: state.properNouns
			})
		})
	)
)

if (import.meta.env.DEV) {
	mountStoreDevtool('dev:store', useStore)
}
