import { DatePickerView, Dropdown, NavBar } from 'antd-mobile'
import dayjs from 'dayjs'
import { upperFirst } from 'lodash'
import { ReactNode, WheelEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EntitiesManagerDropdown } from '../../components/EntitiesManagerDropdown/EntitiesManagerDropdown'
import { NoteCard } from '../../components/NoteCard/NoteCard'
import { Page } from '../../components/Page/Page'
import { QuickSettingsDropdown } from '../../components/QuickSettingsDropdown/QuickSettingsDropdown'
import { SearchInput } from '../../components/SearchInput/SearchInput'
import { useLoadYear } from '../../hooks/useLoadYear'
import { Note } from '../../store/slices/diarySlice'
import { useStore } from '../../store/useStore'

let currentScrollTop: number | undefined = undefined

export function NotesPage(): ReactNode {
	const store = useStore()
	const navigate = useNavigate()
	const loadYear = useLoadYear()
	const currentTime = useStore((state) => state.currentTime)
	const setCurrentTime = useStore((state) => state.setCurrentTime)
	const [currentNotes, setCurrentNotes] = useState<Note[]>([])
	const scrollRef = useRef<HTMLDivElement>(null)

	/**
	 * Cuộn thanh cuộn dọc đến vị trí xác định trong danh sách các mục nhật ký.
	 * @param scrollTop Vị trị thanh cuộn dọc. Nếu không được đặt, vị trí mặc định sẽ là ở giữa.
	 */
	const scrollTo = (scrollTop?: number): void => {
		const scrollEl = scrollRef.current!
		scrollEl.scrollTo(0, scrollTop ?? (scrollEl.scrollHeight - scrollEl.clientHeight) / 2)
	}

	const handleScroll = (event: WheelEvent<HTMLDivElement>): void => {
		const scrollEl = event.currentTarget
		const { scrollTop, scrollHeight, clientHeight } = scrollEl
		const offset = 200
		if (scrollTop <= offset) {
			setCurrentTime(currentTime.subtract(4, 'week'))
		} else if (scrollTop >= scrollHeight - clientHeight - offset) {
			setCurrentTime(currentTime.add(4, 'week'))
		}
		currentScrollTop = scrollTop
		if (scrollTop === 0 && store.isMd) {
			scrollTo()
		}
	}

	const handleYearChange = (date: Date): void => {
		setCurrentTime(currentTime.year(date.getFullYear()))
	}

	const handleNoteClick = (note: Note): void => {
		store.setEditingNote(note)
		navigate('/edit')
	}

	useEffect(() => {
		const notes = []
		const years = new Set<number>()
		let time = currentTime.startOf('week').subtract(7, 'week')
		for (let i = 0; i < 15 * 7; i++) {
			const year = time.year()
			const note: Note = store.getNote(time) ?? store.makeNote(time)
			notes.push(note)
			years.add(year)
			time = time.add(1, 'day')
		}
		setCurrentNotes(notes)
		for (const year of years) {
			loadYear.run(year)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentTime.format('YYYYMMDD'), store.notes])

	useEffect(() => {
		if (currentNotes.length === 0) return
		scrollTo(currentScrollTop)
	}, [currentNotes.length])

	return (
		<Page>
			<div className="flex flex-col h-full">
				<NavBar
					className="md:pl-4 md:pr-8"
					backIcon={null}
					right={
						<div className="flex justify-end items-center md:gap-4">
							{store.isMd && <SearchInput />}
							<EntitiesManagerDropdown />
							<QuickSettingsDropdown />
						</div>
					}
				>
					<Dropdown closeOnClickAway arrow={store.isMd ? undefined : false}>
						<Dropdown.Item key="year" title={currentTime.year()} destroyOnClose>
							<DatePickerView
								min={dayjs().subtract(100, 'year').toDate()}
								max={dayjs().add(100, 'year').toDate()}
								precision="year"
								value={currentTime.toDate()}
								onChange={handleYearChange}
							/>
						</Dropdown.Item>
					</Dropdown>
				</NavBar>

				<div className="flex justify-around md:gap-4 border-b dark:border-zinc-700 md:pl-4 md:pr-8 text-center">
					{dayjs[store.isMd ? 'weekdays' : 'weekdaysMin'](true).map((weekday) => (
						<div key={weekday} className="flex-1">
							{upperFirst(weekday)}
						</div>
					))}
				</div>

				<div
					ref={scrollRef}
					className="flex-1 md:px-4 overflow-auto bg-zinc-50 dark:bg-zinc-900"
					onScroll={handleScroll}
				>
					<div className="grid grid-cols-7 auto-rows-[16vh] md:gap-4">
						{currentNotes.map((note) => (
							<NoteCard
								key={note.date}
								note={note}
								onClick={() => handleNoteClick(note)}
							/>
						))}
					</div>
				</div>
			</div>
		</Page>
	)
}
