import clsx from 'clsx'
import { KeyboardEvent, ReactNode } from 'react'
import { Note, Status } from '../store/slices/diarySlice'
import { useAppStore } from '../store/useAppStore'
import { checkIsLoadedStatus } from '../utils/checkIsLoadedStatus'

interface NoteCardProps {
	note: Note
	showYear?: boolean
	tabIndex?: number
	onNoteClick?: (note: Note) => void
}

export function NoteCard({
	note,
	showYear,
	tabIndex,
	onNoteClick
}: NoteCardProps): ReactNode {
	const isMd = useAppStore((state) => state.isMd)
	const getYear = useAppStore((state) => state.getYear)

	const status: Status = getYear(note.year)
	const loaded: boolean = checkIsLoadedStatus(status)

	const handleClick = (): void => {
		if (!loaded) return
		if (onNoteClick === undefined) return
		onNoteClick(note)
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
		if (event.code !== 'Enter') return
		handleClick()
	}

	return (
		<div
			className={clsx(
				'flex gap-3 rounded-md p-2 xs:items-start xs:gap-6 md:flex-col',
				'group cursor-pointer bg-zinc-800 light:bg-zinc-50',
				!loaded && 'pointer-events-none opacity-50'
			)}
			tabIndex={tabIndex}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
		>
			<div className="flex gap-3">
				<div className="flex xs:justify-center">
					{note.thumbnailUrl && (
						<img
							className="image-contrast w-20 rounded xs:w-16 md:min-w-20"
							src={note.thumbnailUrl}
							loading="lazy"
							alt="Thumbnail"
						/>
					)}
					{!note.thumbnailUrl && (
						<div
							className={clsx(
								'aspect-square w-20 rounded xs:w-16 md:min-w-20',
								'bg-zinc-700 light:bg-zinc-200',
								note.sha ? 'visible' : 'invisible'
							)}
						/>
					)}
				</div>

				<div className="flex-1 text-right text-sm xs:text-left">
					<div
						className={clsx(
							'font-semibold',
							note.time.date() === 1 && 'text-blue-400 light:text-blue-600'
						)}
					>
						{isMd && (
							<>
								{note.time.format('DD-MM')}
								<span
									className={clsx(
										'text-zinc-400',
										!showYear && 'hidden md:group-hover:inline'
									)}
								>
									-{note.year}
								</span>
							</>
						)}
						{!isMd && note.time.format('dd, DD-MM-YYYY')}
					</div>
					<div className="text-zinc-500">
						{note.lunar.day}-{note.lunar.month}
					</div>
				</div>
			</div>

			<div className="line-clamp-2 break-words text-sm text-zinc-400 light:text-zinc-600 xs:line-clamp-3 xs:flex-1">
				{note.title}
			</div>

			{note.time.isToday() && (
				<div className="flex items-end justify-center xs:h-full xs:items-center md:flex-1">
					<div className="rounded-full bg-blue-500 xs:h-12 xs:w-1 md:h-1 md:w-12" />
				</div>
			)}
		</div>
	)
}
