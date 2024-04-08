import { DatePickerView, Dropdown, NavBar, SearchBar } from 'antd-mobile'
import dayjs from 'dayjs'
import { upperFirst } from 'lodash'
import { WheelEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NoteCard } from '../../components/NoteCard/NoteCard'
import { Page } from '../../components/Page/Page'
import { PersonsManagerDropdown } from '../../components/PersonsManagerDropdown/PersonsManagerDropdown'
import { QuickSettingsButton } from '../../components/QuickSettingsButton/QuickSettingsButton'
import { useLoadYear } from '../../hooks/useLoadYear'
import { Note } from '../../store/slices/diarySlice'
import { useStore } from '../../store/useStore'

export function NotesPage() {
	const store = useStore()
	const navigate = useNavigate()
	const loadYear = useLoadYear()
	const currentTime = useStore((state) => state.currentTime)
	const setCurrentTime = useStore((state) => state.setCurrentTime)
	const currentScrollTop = useStore((state) => state.currentScrollTop)
	const setCurrentScrollTop = useStore((state) => state.setCurrentScrollTop)
	const [currentNotes, setCurrentNotes] = useState<Note[]>([])
	const scrollRef = useRef<HTMLDivElement>(null)

	const scrollTo = (scrollTop?: number) => {
		const scrollEl = scrollRef.current!
		scrollEl.scrollTo(0, scrollTop ?? (scrollEl.scrollHeight - scrollEl.clientHeight) / 2)
	}

	const handleScroll = (event: WheelEvent<HTMLDivElement>) => {
		const scrollEl = event.currentTarget
		const { scrollTop, scrollHeight, clientHeight } = scrollEl
		if (scrollTop === 0) {
			scrollTo()
			return
		}
		const offset = 200
		if (scrollTop <= offset) {
			setCurrentTime(currentTime.subtract(4, 'week'))
		} else if (scrollTop >= scrollHeight - clientHeight - offset) {
			setCurrentTime(currentTime.add(4, 'week'))
		}
		setCurrentScrollTop(scrollTop)
	}

	const handleYearChange = (date: Date) => {
		setCurrentTime(currentTime.year(date.getFullYear()))
	}

	const handleNoteClick = (note: Note) => {
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
	}, [currentTime.format('YYYY-MM-DD'), store.notes])

	useEffect(() => {
		if (currentNotes.length === 0) return
		scrollTo(currentScrollTop)
	}, [currentNotes.length > 0])

	return (
		<Page>
			<div className="flex flex-col h-full">
				<NavBar
					className="pr-8"
					backArrow={null}
					right={
						<div className="flex justify-end items-center gap-4">
							<SearchBar className="flex-1" placeholder="Tìm kiếm..." />

							<PersonsManagerDropdown />
							<QuickSettingsButton />
						</div>
					}
				>
					<Dropdown closeOnClickAway>
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

				<div className="flex justify-around gap-4 border-b dark:border-neutral-700 pl-4 pr-8 text-center">
					{dayjs.weekdays(true).map((weekday) => (
						<div key={weekday} className="flex-1">
							{upperFirst(weekday)}
						</div>
					))}
				</div>

				<div
					ref={scrollRef}
					className="flex-1 grid grid-cols-7 auto-rows-[18%] gap-4 px-4 overflow-auto bg-neutral-50 dark:bg-neutral-900"
					onScroll={handleScroll}
				>
					{currentNotes.map((note) => (
						<NoteCard key={note.date} note={note} onClick={() => handleNoteClick(note)} />
					))}
				</div>
			</div>
		</Page>
	)
}
