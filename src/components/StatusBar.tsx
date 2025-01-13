import dayjs from 'dayjs'
import { ReactNode } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Link2 } from './Link2'

export function StatusBar(): ReactNode {
	const userName = useAppStore((state) => state.userName)
	const userAvatar = useAppStore((state) => state.userAvatar)
	const orgName = useAppStore((state) => state.orgName)
	const rateLimitTimeReset = useAppStore((state) => state.rateLimitTimeReset)
	const rateLimitRemaining = useAppStore((state) => state.rateLimitRemaining)
	const rateLimitTotal = useAppStore((state) => state.rateLimitTotal)
	const nowPerMinute = useAppStore((state) => state.nowPerMinute)
	const isMd = useAppStore((state) => state.isMd)

	return (
		<div className="z-10 flex justify-between bg-zinc-900/90 px-4 py-1 align-middle text-sm light:bg-zinc-200/90">
			<div className="flex gap-4 align-middle">
				{userName && (
					<div className="flex gap-3 xs:hidden">
						<img className="h-5 w-5 rounded" src={userAvatar} alt="Ảnh đại diện" />
						<div className="flex gap-1">
							Người dùng:
							<Link2 href="https://github.com/settings/tokens?type=beta">
								{userName}
							</Link2>
						</div>
					</div>
				)}

				{orgName && (
					<div className="flex gap-1 xs:hidden">
						Tổ chức:
						<Link2 href={`https://github.com/${orgName}/diori-main`}>{orgName}</Link2>
					</div>
				)}
			</div>

			<div className="flex gap-4 align-middle">
				<div className="xs:hidden">{dayjs().format('HH:mm:ss.SSS')}</div>

				{rateLimitTimeReset && (
					<>
						{isMd && (
							<div>
								Giới hạn API: Còn lại {rateLimitRemaining} / {rateLimitTotal}, đặt
								lại sau {rateLimitTimeReset.from(nowPerMinute, true)}
							</div>
						)}
						{!isMd && (
							<div>
								{rateLimitRemaining} / {rateLimitTotal}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}
