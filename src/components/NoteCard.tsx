import clsx from 'clsx'
import { KeyboardEvent, ReactNode, useMemo } from 'react'
import { Note, Status } from '../store/slices/diarySlice'
import { useStore } from '../store/useStore'
import { checkIsLoadedStatus } from '../utils/checkIsLoadedStatus'

interface NoteCardProps {
	note: Note
	tabIndex?: number
	onNoteClick?: (note: Note) => void
}

export function NoteCard({ note, tabIndex, onNoteClick }: NoteCardProps): ReactNode {
	const years = useStore((state) => state.years)
	const isMd = useStore<boolean>((state) => state.isMd)

	const status = useMemo<Status>(() => {
		return years[note.year]
	}, [years, note.year])

	const loaded = useMemo<boolean>(() => {
		return checkIsLoadedStatus(status)
	}, [status])

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
				'flex md:flex-col xs:items-start gap-3 xs:gap-6 p-2 rounded-md',
				'bg-zinc-800 light:bg-zinc-50 cursor-pointer group',
				!loaded && 'opacity-50 pointer-events-none'
			)}
			tabIndex={tabIndex}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
		>
			<div className="flex gap-3">
				<div className="flex xs:justify-center">
					{note.thumbnailUrl && (
						<img
							className="w-20 md:min-w-20 xs:w-16 rounded image-contrast"
							src={note.thumbnailUrl}
							loading="lazy"
							alt="Thumbnail"
						/>
					)}
					{!note.thumbnailUrl && (
						<div
							className={clsx(
								'w-20 md:min-w-20 xs:w-16 aspect-square rounded',
								'bg-zinc-700 light:bg-zinc-200',
								note.sha ? 'visible' : 'invisible'
							)}
						/>
					)}
				</div>

				<div className="flex-1 text-right xs:text-left text-sm">
					<div
						className={clsx(
							'font-semibold',
							note.time.date() === 1 && 'text-blue-400 light:text-blue-600'
						)}
					>
						{isMd && (
							<>
								{note.time.format('DD-MM')}
								<span className="hidden md:group-hover:inline">-{note.year}</span>
							</>
						)}
						{!isMd && note.time.format('dd, DD-MM-YYYY')}
					</div>
					<div className="text-zinc-500">
						{note.lunar.day}-{note.lunar.month}
					</div>
				</div>
			</div>

			<div className="xs:flex-1 text-sm line-clamp-2 xs:line-clamp-3 break-words text-zinc-400 light:text-zinc-600">
				{note.title}
			</div>

			{note.time.isToday() && (
				<div className="md:flex-1 flex justify-center items-end xs:items-center xs:h-full">
					<div className="md:w-12 md:h-1 xs:w-1 xs:h-12 rounded-full bg-blue-500" />
				</div>
			)}
		</div>
	)
}
