import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Diary, diarySlice } from './slices/DiarySlice'
import { Settings, settingsSlice } from './slices/settingsSlice'
import { User, userSlice } from './slices/userSlice'

export type SliceCreator<T> = StateCreator<Store, [['zustand/immer', never]], [], T>

export type Store = User & Settings & Diary

const store: StateCreator<Store> = (...args) => ({
	...userSlice(...args),
	...settingsSlice(...args),
	...diarySlice(...args)
})

export const useStore = create<Store>()(
	immer(
		persist(store, {
			name: 'diori:store',

			partialize: (state) => ({
				orgName: state.orgName,
				encryptedToken: state.encryptedToken
			})
		})
	)
)
