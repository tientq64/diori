import { NavBar, Result } from 'antd-mobile'
import { SearchOutline } from 'antd-mobile-icons'
import { ReactNode, useEffect, useRef, WheelEvent } from 'react'
import { useNavigate } from 'react-router'
import { EntitiesManagerButton } from '../components/EntitiesManagerButton'
import { NoteCard } from '../components/NoteCard'
import { Page } from '../components/Page'
import { QuickSettingsButton } from '../components/QuickSettingsButton'
import { SearchInput } from '../components/SearchInput'
import { useSearch } from '../hooks/useSearch'
import { Note } from '../store/slices/diarySlice'
import { useStore } from '../store/useStore'

let currentScrollTop: number = 0

export function SearchPage(): ReactNode {
	const isMd = useStore((state) => state.isMd)
	const isXs = useStore((state) => state.isXs)
	const searchText = useStore((state) => state.searchText)
	const searchPage = useStore((state) => state.searchPage)
	const searchPageTotal = useStore((state) => state.searchPageTotal)
	const searchNotes = useStore((state) => state.searchNotes)
	const searchNotesTotal = useStore((state) => state.searchNotesTotal)
	const searchLoading = useStore((state) => state.searchLoading)
	const searchError = useStore((state) => state.searchError)
	const setEditingNote = useStore((state) => state.setEditingNote)

	const search = useSearch()
	const navigate = useNavigate()
	const scrollRef = useRef<HTMLDivElement | null>(null)

	const handleNoteClick = (note: Note): void => {
		setEditingNote(note)
		navigate(`/edit/${note.date}`, {
			state: {
				findText: searchText
			}
		})
	}

	const handleScroll = (event: WheelEvent<HTMLDivElement>): void => {
		const scrollEl = event.currentTarget
		const { scrollTop, scrollHeight, clientHeight } = scrollEl
		currentScrollTop = scrollTop
		if (scrollTop >= scrollHeight - clientHeight) {
			search.run(searchText, searchPage + 1)
		}
	}

	useEffect(() => {
		if (searchPage === 1) {
			currentScrollTop = 0
		}
	}, [searchPage])

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
							<div className="flex items-center gap-2 text-base">
								{isMd ? 'Kết quả tìm kiếm cho:' : 'Kết quả:'}
								<span className="text-lime-200 light:text-lime-600">
									{searchText}
								</span>
								<span className="text-zinc-500">- {searchNotesTotal} mục</span>
							</div>
						}
						right={
							isMd && (
								<div className="flex justify-end items-center md:gap-4">
									<SearchInput />
									<EntitiesManagerButton />
									<QuickSettingsButton />
								</div>
							)
						}
					/>
					{isXs && (
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
					{searchNotes.length > 0 && (
						<>
							<div className="grid md:grid-cols-7 md:auto-rows-[17vh] gap-3 xs:gap-2">
								{searchNotes.map((note) => (
									<NoteCard
										key={note.date}
										note={note}
										onNoteClick={handleNoteClick}
									/>
								))}
							</div>

							{!searchError && searchPage < searchPageTotal && (
								<div className="mt-4 text-center">Đang tải thêm...</div>
							)}

							{searchError && (
								<div className="mt-4 text-center text-rose-400">Đã xảy ra lỗi</div>
							)}
						</>
					)}

					{searchNotes.length === 0 && (
						<div className="flex justify-center items-center h-full">
							{searchLoading && 'Đang tìm kiếm...'}

							{searchError && (
								<Result
									className="w-full"
									status="error"
									title="Đã xảy ra lỗi"
									description={
										<div className="md:w-2/5 m-auto">{String(searchError)}</div>
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
