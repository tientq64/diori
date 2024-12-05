import clsx from 'clsx'
import { FocusEvent, KeyboardEvent, MouseEvent, useMemo } from 'react'
import { Note, Status } from '../store/slices/diarySlice'
import { useStore } from '../store/useStore'
import { checkIsLoadedStatus } from '../utils/checkIsLoadedStatus'

interface NoteCardProps {
	note: Note
	onClick?: () => void
}

export function NoteCard({ note, onClick }: NoteCardProps) {
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
		if (onClick === undefined) return
		onClick()
	}

	return (
		<div
			className={clsx(
				'flex md:flex-col xs:items-start gap-3 xs:gap-6 p-2 rounded-md',
				'bg-zinc-800 light:bg-white cursor-pointer group',
				!loaded && 'opacity-50 pointer-events-none'
			)}
			onClick={handleClick}
		>
			<div className="flex gap-3">
				<div className="flex xs:justify-center">
					{note.thumbnailUrl && (
						<img
							className="w-20 md:min-w-20 xs:w-16 rounded image-contrast"
							src={note.thumbnailUrl}
							alt="Thumbnail"
						/>
					)}
					{!note.thumbnailUrl && (
						<div
							className={clsx(
								'w-20 md:min-w-20 xs:w-16 aspect-square rounded',
								'bg-zinc-700 light:bg-zinc-100',
								note.sha ? 'visible' : 'invisible'
							)}
						/>
					)}
				</div>

				<div className="flex-1 text-right xs:text-left text-sm">
					{isMd && (
						<div>
							{note.time.format('DD-MM')}
							<span className="hidden md:group-hover:inline">-{note.year}</span>
						</div>
					)}
					{!isMd && note.time.format('dd, DD-MM-YYYY')}
					<div className="text-zinc-400 dark:text-zinc-500">
						{note.lunar.day}-{note.lunar.month}
					</div>
				</div>
			</div>

			<div className="xs:flex-1 text-sm line-clamp-2 xs:line-clamp-3 break-words dark:text-zinc-400">
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
