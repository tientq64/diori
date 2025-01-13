import { NavBar, Result } from 'antd-mobile'
import { SearchOutline } from 'antd-mobile-icons'
import { ReactNode, useEffect, useRef, WheelEvent } from 'react'
import { useNavigate } from 'react-router'
import { EntitiesManagerButton } from '../components/EntitiesManagerButton'
import { NoteCard } from '../components/NoteCard'
import { QuickSettingsButton } from '../components/QuickSettingsButton'
import { SearchInput } from '../components/SearchInput'
import { useSearch } from '../hooks/useSearch'
import { Note } from '../store/slices/diarySlice'
import { useAppStore } from '../store/useAppStore'

let currentScrollTop: number = 0

export function SearchPage(): ReactNode {
	const isMd = useAppStore((state) => state.isMd)
	const isXs = useAppStore((state) => state.isXs)
	const searchText = useAppStore((state) => state.searchText)
	const searchPage = useAppStore((state) => state.searchPage)
	const searchPageTotal = useAppStore((state) => state.searchPageTotal)
	const searchNotes = useAppStore((state) => state.searchNotes)
	const searchNotesTotal = useAppStore((state) => state.searchNotesTotal)
	const searchLoading = useAppStore((state) => state.searchLoading)
	const searchError = useAppStore((state) => state.searchError)

	const search = useSearch()
	const navigate = useNavigate()
	const scrollRef = useRef<HTMLDivElement | null>(null)

	const handleNoteClick = (note: Note): void => {
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
		<div className="flex flex-1 flex-col">
			<div>
				<NavBar
					className="md:pl-4 md:pr-8"
					backIcon={<SearchOutline />}
					left={
						<div className="flex items-center gap-2 text-base">
							{isMd ? 'Kết quả tìm kiếm cho:' : 'Kết quả:'}
							<span className="text-lime-200 light:text-lime-600">{searchText}</span>
							<span className="text-zinc-500">- {searchNotesTotal} mục</span>
						</div>
					}
					right={
						isMd && (
							<div className="flex items-center justify-end md:gap-4">
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
				className="flex-1 overflow-auto bg-zinc-900 px-4 light:bg-zinc-100 xs:px-2"
				onScroll={handleScroll}
			>
				{searchNotes.length > 0 && (
					<>
						<div className="grid gap-3 xs:gap-2 md:auto-rows-[17vh] md:grid-cols-7">
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
					<div className="flex h-full items-center justify-center">
						{searchLoading && 'Đang tìm kiếm...'}

						{searchError && (
							<Result
								className="w-full"
								status="error"
								title="Đã xảy ra lỗi"
								description={
									<div className="m-auto md:w-2/5">{String(searchError)}</div>
								}
							/>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
