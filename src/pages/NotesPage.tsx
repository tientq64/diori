import { DatePickerView, Dropdown, NavBar } from 'antd-mobile'
import dayjs, { Dayjs } from 'dayjs'
import { upperFirst } from 'lodash'
import { ReactNode, WheelEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import pkg from '../../package.json'
import { EntitiesManagerDropdown } from '../components/EntitiesManagerDropdown'
import { NoteCard } from '../components/NoteCard'
import { Page } from '../components/Page'
import { QuickSettingsDropdown } from '../components/QuickSettingsDropdown'
import { SearchInput } from '../components/SearchInput'
import { useLoadYear } from '../hooks/useLoadYear'
import { Note } from '../store/slices/diarySlice'
import { useStore } from '../store/useStore'
import { getLunarYearName } from '../utils/getLunarYearName'

let currentScrollTop: number | undefined = undefined

export function NotesPage(): ReactNode {
	const isMd = useStore((state) => state.isMd)
	const isXs = useStore((state) => state.isXs)
	const notes = useStore((state) => state.notes)
	const currentTime = useStore((state) => state.currentTime)
	const getNote = useStore((state) => state.getNote)
	const makeNote = useStore((state) => state.makeNote)
	const setEditingNote = useStore((state) => state.setEditingNote)
	const setCurrentTime = useStore((state) => state.setCurrentTime)

	const navigate = useNavigate()
	const loadYear = useLoadYear()
	const [currentNotes, setCurrentNotes] = useState<Note[]>([])
	const scrollRef = useRef<HTMLDivElement>(null)

	const currentLunarYearName = useMemo<string>(() => {
		return getLunarYearName(currentTime.year())
	}, [currentTime])

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
		const offsetScroll: number = isMd ? 200 : 1000
		const offsetWeek: number = isMd ? 4 : 2
		if (scrollTop <= offsetScroll) {
			setCurrentTime(currentTime.subtract(offsetWeek, 'week'))
		} else if (scrollTop >= scrollHeight - clientHeight - offsetScroll) {
			setCurrentTime(currentTime.add(offsetWeek, 'week'))
		}
		currentScrollTop = scrollTop
		if (scrollTop === 0 && isMd) {
			scrollTo()
		}
	}

	const handleYearChange = (date: Date): void => {
		setCurrentTime(currentTime.year(date.getFullYear()))
	}

	const handleNoteClick = (note: Note): void => {
		setEditingNote(note)
		navigate(`/edit/${note.date}`)
	}

	useEffect(() => {
		const notes: Note[] = []
		const years = new Set<number>()
		const numberWeek: number = isMd ? 15 : 7
		const firstOffsetWeek: number = isMd ? 7 : 3
		let time: Dayjs = currentTime.startOf('week').subtract(firstOffsetWeek, 'week')
		for (let i = 0; i < numberWeek * 7; i++) {
			const year = time.year()
			const note: Note = getNote(time) ?? makeNote(time)
			notes.push(note)
			years.add(year)
			time = time.add(1, 'day')
		}
		setCurrentNotes(notes)
		for (const year of years) {
			loadYear.run(year)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentTime.format('YYYYMMDD'), notes])

	useEffect(() => {
		if (currentNotes.length === 0) return
		scrollTo(currentScrollTop)
	}, [currentNotes.length])

	const renderYearDropdown = (): ReactNode => {
		return (
			<Dropdown closeOnClickAway>
				<Dropdown.Item
					key="year"
					title={
						<>
							{currentTime.year()}: {currentLunarYearName}
						</>
					}
					destroyOnClose
				>
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
					left={
						<>
							{isMd && <div className="text-base">Diori {pkg.version}</div>}
							{isXs && renderYearDropdown()}
						</>
					}
					right={
						<div className="flex justify-end items-center md:gap-4">
							{isMd && <SearchInput />}
							<EntitiesManagerDropdown />
							<QuickSettingsDropdown />
						</div>
					}
				>
					{isMd && renderYearDropdown()}
				</NavBar>

				{isMd && (
					<div className="flex justify-around md:gap-4 md:pl-4 md:pr-8 text-center">
						{dayjs[isMd ? 'weekdays' : 'weekdaysMin'](true).map((weekday) => (
							<div key={weekday} className="flex-1">
								{upperFirst(weekday)}
							</div>
						))}
					</div>
				)}
				{isXs && (
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
