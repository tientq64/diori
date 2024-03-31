import { DatePickerView, Dropdown, NavBar, PickerView, SearchBar } from 'antd-mobile'
import dayjs, { Dayjs } from 'dayjs'
import { upperFirst } from 'lodash'
import { WheelEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VietnameseDate from 'vietnamese-date'
import { NoteCard } from '../../components/NoteCard/NoteCard'
import { Page } from '../../components/Page/Page'
import { QuickSettingsButton } from '../../components/QuickSettingsButton/QuickSettingsButton'
import { Note } from '../../store/slices/diarySlice'
import { useStore } from '../../store/useStore'
import { useLoadYear } from './useLoadYear'

export function NotesPage() {
	const store = useStore()
	const navigate = useNavigate()
	const loadYear = useLoadYear()
	const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs())
	const [currentNotes, setCurrentNotes] = useState<Note[]>([])
	const scrollRef = useRef<HTMLDivElement>(null)

	const scrollToMiddle = () => {
		const scrollEl = scrollRef.current!
		scrollEl.scrollTo(0, (scrollEl.scrollHeight - scrollEl.clientHeight) / 2)
	}

	const handleScroll = (event: WheelEvent<HTMLDivElement>) => {
		const scrollEl = event.currentTarget
		const { scrollTop, scrollHeight, clientHeight } = scrollEl
		const offset = 200
		if (scrollTop === 0) {
			scrollToMiddle()
		}
		if (scrollTop <= offset) {
			setCurrentTime(currentTime.subtract(4, 'week'))
		} else if (scrollTop >= scrollHeight - clientHeight - offset) {
			setCurrentTime(currentTime.add(4, 'week'))
		}
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
			const date = time.format('YYYY-MM-DD')
			const note: Note = store.notes[date] ?? {
				date,
				time,
				lunar: new VietnameseDate(time.toDate()),
				year,
				title: '',
				isTitled: false,
				thumbnailUrl: '',
				photoKey: '',
				numberPhotos: 0
			}
			notes.push(note)
			years.add(year)
			time = time.add(1, 'day')
		}
		for (const year of years) {
			loadYear.trigger(year)
		}
		setCurrentNotes(notes)
	}, [currentTime, store.notes])

	useEffect(() => {
		if (currentNotes.length === 0) return
		scrollToMiddle()
	}, [currentNotes.length > 0])

	return (
		<Page>
			<div className="flex flex-col h-full">
				<NavBar
					className="pr-8"
					right={
						<div className="flex justify-end items-center gap-4">
							<SearchBar className="flex-1" placeholder="Tìm kiếm..." />
							<QuickSettingsButton />
						</div>
					}
				>
					<Dropdown closeOnClickAway>
						<Dropdown.Item key="year" title={currentTime.year()}>
							<DatePickerView
								min={currentTime.subtract(10, 'year').toDate()}
								max={currentTime.add(10, 'year').toDate()}
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
					className="flex-1 grid grid-cols-7 auto-rows-[18%] gap-4 px-4 overflow-auto bg-gray-50 dark:bg-neutral-900"
					onScroll={handleScroll}
				>
					{currentNotes.map((note) => (
						<NoteCard
							key={note.date}
							note={note}
							onClick={() => handleNoteClick(note)}
						/>
					))}
				</div>
			</div>
		</Page>
	)
}
