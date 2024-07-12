import { MouseEvent, useMemo } from 'react'
import { Note, Status } from '../../store/slices/diarySlice'
import { useStore } from '../../store/useStore'
import { isLoadedStatus } from '../../utils/isLoadedStatus'

type NoteCardProps = {
	note: Note
	onClick?: (event: MouseEvent<HTMLDivElement>) => void
}

export function NoteCard({ note, onClick }: NoteCardProps) {
	const years = useStore((state) => state.years)

	const status = useMemo<Status>(() => {
		return years[note.year]
	}, [years, note.year])

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		if (isLoadedStatus(status)) {
			onClick?.(event)
		}
	}

	return (
		<div
			className={`
				flex flex-col gap-2 xs:gap-1 md:p-2 md:rounded border dark:border-zinc-800
				xs:text-center bg-white dark:bg-zinc-800 cursor-pointer group
				${isLoadedStatus(status) ? '' : 'opacity-50 pointer-events-none'}
			`}
			onClick={handleClick}
		>
			<div className="flex xs:flex-col-reverse xs:items-center">
				<div className="flex-1 flex xs:justify-center">
					{note.thumbnailUrl && (
						<img
							className="w-20 md:min-w-20 xs:w-10 rounded"
							src={note.thumbnailUrl}
							alt="Thumbnail"
						/>
					)}
					{!note.thumbnailUrl && note.sha && (
						<div className="w-20 md:min-w-20 xs:w-10 aspect-square rounded bg-zinc-100 dark:bg-zinc-700" />
					)}
				</div>

				<div className="md:text-right text-sm">
					<div>
						{note.time.format('DD-MM')}
						<span className="hidden md:group-hover:inline">-{note.year}</span>
					</div>
					<div className="xs:hidden text-zinc-400 dark:text-zinc-500">
						{note.lunar.day}-{note.lunar.month}
					</div>
				</div>
			</div>

			<div className="xs:text-xs text-sm xs:leading-3 line-clamp-2 break-words dark:text-zinc-400">
				{note.title}
			</div>

			{note.time.isToday() && (
				<div className="flex-1 flex items-end justify-center">
					<div className="w-12 h-1 rounded-full bg-blue-500"></div>
				</div>
			)}
		</div>
	)
}
