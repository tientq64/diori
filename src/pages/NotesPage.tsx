import { DatePickerView, Dropdown, NavBar } from 'antd-mobile'
import dayjs, { Dayjs } from 'dayjs'
import { upperFirst } from 'lodash'
import { ReactNode, WheelEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EntitiesManagerDropdown } from '../components/EntitiesManagerDropdown'
import { NoteCard } from '../components/NoteCard'
import { Page } from '../components/Page'
import { QuickSettingsDropdown } from '../components/QuickSettingsDropdown'
import { SearchInput } from '../components/SearchInput'
import { useLoadYear } from '../hooks/useLoadYear'
import { Note } from '../store/slices/diarySlice'
import { useStore } from '../store/useStore'

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
		const offsetScroll: number = store.isMd ? 200 : 1000
		const offsetWeek: number = store.isMd ? 4 : 2
		if (scrollTop <= offsetScroll) {
			setCurrentTime(currentTime.subtract(offsetWeek, 'week'))
		} else if (scrollTop >= scrollHeight - clientHeight - offsetScroll) {
			setCurrentTime(currentTime.add(offsetWeek, 'week'))
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
		navigate(`/edit/${note.date}`)
	}

	useEffect(() => {
		const notes: Note[] = []
		const years = new Set<number>()
		const numberWeek: number = store.isMd ? 15 : 7
		const firstOffsetWeek: number = store.isMd ? 7 : 3
		let time: Dayjs = currentTime.startOf('week').subtract(firstOffsetWeek, 'week')
		for (let i = 0; i < numberWeek * 7; i++) {
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

	const renderYearDropdown = (): ReactNode => {
		return (
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
		)
	}

	return (
		<Page>
			<div className="flex flex-col h-full">
				<NavBar
					className="md:pl-4 md:pr-8"
					backIcon={null}
					left={store.isXs && renderYearDropdown()}
					right={
						<div className="flex justify-end items-center md:gap-4">
							{store.isMd && <SearchInput />}
							<EntitiesManagerDropdown />
							<QuickSettingsDropdown />
						</div>
					}
				>
					{store.isMd && renderYearDropdown()}
				</NavBar>

				{store.isMd && (
					<div className="flex justify-around md:gap-4 md:pl-4 md:pr-8 text-center">
						{dayjs[store.isMd ? 'weekdays' : 'weekdaysMin'](true).map((weekday) => (
							<div key={weekday} className="flex-1">
								{upperFirst(weekday)}
							</div>
						))}
					</div>
				)}
				{store.isXs && (
					<div className="px-2 pb-2">
						<SearchInput />
					</div>
				)}

				<div
					ref={scrollRef}
					className="flex-1 px-4 xs:px-2 overflow-auto bg-zinc-900 light:bg-zinc-100"
					onScroll={handleScroll}
				>
					<div className="grid md:grid-cols-7 md:auto-rows-[17vh] gap-3 xs:gap-2">
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
