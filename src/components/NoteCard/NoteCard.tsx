import clsx from 'clsx'
import { MouseEvent, useMemo } from 'react'
import { isLoadedStatus } from '../../helpers/isLoadedStatus'
import { Note, Status } from '../../store/slices/diarySlice'
import { useStore } from '../../store/useStore'

type NoteCardProps = {
	note: Note
	onClick?: (event: MouseEvent<HTMLDivElement>) => void
}

export function NoteCard({ note, onClick }: NoteCardProps) {
	const years = useStore((state) => state.years)

	const status = useMemo<Status>(() => {
		return years[note.year]
	}, [years[note.year]])

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		if (isLoadedStatus(status)) {
			onClick?.(event)
		}
	}

	return (
		<div
			className={clsx(
				'flex flex-col gap-2 p-2 rounded border dark:border-neutral-800 bg-white dark:bg-neutral-800 cursor-pointer group',
				{
					'opacity-50 pointer-events-none': !isLoadedStatus(status)
				}
			)}
			onClick={handleClick}
		>
			<div className="flex">
				<div className="flex-1">
					{note.thumbnailUrl && (
						<img
							className="w-20 h-20 min-w-20 rounded"
							src={note.thumbnailUrl}
							alt="Thumbnail"
						/>
					)}
					{!note.thumbnailUrl && note.sha && (
						<div className="w-20 h-20 rounded bg-gray-100" />
					)}
				</div>

				<div className="text-right">
					<div>
						{note.time.format('DD-MM')}
						<span className="hidden group-hover:inline">-{note.year}</span>
					</div>
					<div className="text-gray-400">
						{note.lunar.day}-{note.lunar.month}
					</div>
				</div>
			</div>

			{note.title}

			{note.time.isToday() && (
				<div className="flex-1 flex items-end justify-center">
					<div className="w-12 h-1 rounded-full bg-blue-500"></div>
				</div>
			)}
		</div>
	)
}
