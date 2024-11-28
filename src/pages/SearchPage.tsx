import { NavBar, Result } from 'antd-mobile'
import { SearchOutline } from 'antd-mobile-icons'
import { ReactNode, useEffect, useRef, WheelEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { EntitiesManagerDropdown } from '../components/EntitiesManagerDropdown'
import { NoteCard } from '../components/NoteCard'
import { Page } from '../components/Page'
import { QuickSettingsDropdown } from '../components/QuickSettingsDropdown'
import { SearchInput } from '../components/SearchInput'
import { useSearch } from '../hooks/useSearch'
import { Note } from '../store/slices/diarySlice'
import { useStore } from '../store/useStore'

let currentScrollTop: number = 0

export function SearchPage(): ReactNode {
	const store = useStore()
	const search = useSearch()
	const navigate = useNavigate()
	const scrollRef = useRef<HTMLDivElement>(null)

	const handleNoteClick = (note: Note): void => {
		store.setEditingNote(note)
		navigate(`/edit/${note.date}`, {
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
				<div>
					<NavBar
						className="md:pl-4 md:pr-8"
						backIcon={<SearchOutline />}
						left={
							<div className="flex items-center gap-2">
								{store.isMd ? 'Kết quả tìm kiếm cho:' : 'Kết quả:'}
								<span className="text-lime-200 light:text-lime-600">
									{store.searchText}
								</span>
								<span className="text-zinc-500">
									- {store.searchNotesTotal} mục
								</span>
							</div>
						}
						right={
							store.isMd && (
								<div className="flex justify-end items-center md:gap-4">
									<SearchInput />
									<EntitiesManagerDropdown />
									<QuickSettingsDropdown />
								</div>
							)
						}
					/>
					{store.isXs && (
						<div className="px-2 pb-2">
							<SearchInput />
						</div>
					)}
				</div>

				<div
					ref={scrollRef}
					className="flex-1 px-4 xs:px-2 overflow-auto bg-zinc-900 light:bg-zinc-100"
					onScroll={handleScroll}
				>
					{store.searchNotes.length > 0 && (
						<>
							<div className="grid md:grid-cols-7 md:auto-rows-[17vh] gap-3 xs:gap-2">
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
