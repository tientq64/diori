import { NavBar, Result } from 'antd-mobile'
import { SearchOutline } from 'antd-mobile-icons'
import { ReactNode, useEffect, useRef, WheelEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { EntitiesManagerDropdown } from '../../components/EntitiesManagerDropdown/EntitiesManagerDropdown'
import { NoteCard } from '../../components/NoteCard/NoteCard'
import { Page } from '../../components/Page/Page'
import { QuickSettingsDropdown } from '../../components/QuickSettingsDropdown/QuickSettingsDropdown'
import { SearchInput } from '../../components/SearchInput/SearchInput'
import { useSearch } from '../../hooks/useSearch'
import { Note } from '../../store/slices/diarySlice'
import { useStore } from '../../store/useStore'

let currentScrollTop: number = 0

export function SearchPage(): ReactNode {
	const store = useStore()
	const search = useSearch()
	const navigate = useNavigate()
	const scrollRef = useRef<HTMLDivElement>(null)

	const handleNoteClick = (note: Note): void => {
		store.setEditingNote(note)
		navigate('/edit', {
			state: {
				findText: store.searchText
			}
		})
	}

	const handleScroll = (event: WheelEvent<HTMLDivElement>): void => {
		const scrollEl = event.currentTarget
		const { scrollTop, scrollHeight, clientHeight } = scrollEl
		currentScrollTop = scrollTop
		if (scrollTop >= scrollHeight - clientHeight) {
			search.run(store.searchText, store.searchPage + 1)
		}
	}

	useEffect(() => {
		if (store.searchPage === 1) {
			currentScrollTop = 0
		}
	}, [store.searchPage])

	useEffect(() => {
		if (!scrollRef.current) return
		scrollRef.current.scrollTop = currentScrollTop
	}, [scrollRef])

	return (
		<Page>
			<div className="flex flex-col h-full">
				<div className="border-b dark:border-zinc-700">
					<NavBar
						className="md:pl-4 md:pr-8"
						backIcon={<SearchOutline />}
						left={
							<div className="flex items-center gap-2">
								Kết quả tìm kiếm cho:
								<span className="text-lime-200">{store.searchText}</span>
								<span className="text-zinc-500">
									- {store.searchNotesTotal} mục
								</span>
							</div>
						}
						right={
							<div className="flex justify-end items-center md:gap-4">
								{store.isMd && <SearchInput />}
								<EntitiesManagerDropdown />
								<QuickSettingsDropdown />
							</div>
						}
					/>
				</div>

				<div
					ref={scrollRef}
					className="flex-1 py-4 md:px-4 overflow-auto bg-zinc-50 dark:bg-zinc-900"
					onScroll={handleScroll}
				>
					{store.searchNotes.length > 0 && (
						<>
							<div className="grid grid-cols-7 auto-rows-[16vh] md:gap-4">
								{store.searchNotes.map((note) => (
									<NoteCard
										key={note.date}
										note={note}
										onClick={() => handleNoteClick(note)}
									/>
								))}
							</div>

							{!store.searchError && store.searchPage < store.searchPageTotal && (
								<div className="mt-4 text-center">Đang tải thêm...</div>
							)}

							{store.searchError && (
								<div className="mt-4 text-center text-rose-400">Đã xảy ra lỗi</div>
							)}
						</>
					)}

					{store.searchNotes.length === 0 && (
						<div className="flex justify-center items-center h-full">
							{store.searchLoading && 'Đang tìm kiếm...'}

							{store.searchError && (
								<Result
									className="w-full"
									status="error"
									title="Đã xảy ra lỗi"
									description={
										<div className="md:w-2/5 m-auto">
											{String(store.searchError)}
										</div>
									}
								/>
							)}
						</div>
					)}
				</div>
			</div>
		</Page>
	)
}
