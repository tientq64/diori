import dayjs from 'dayjs'
import { ReactNode } from 'react'
import { useStore } from '../store/useStore'
import { Link2 } from './Link2'

interface PageProps {
	children: ReactNode
}

/**
 * Thành phần tạo layout mặc định cho các trang. Mỗi trang nên được bọc trong thành phần này.
 */
export function Page({ children }: PageProps): ReactNode {
	const userName = useStore((state) => state.userName)
	const userAvatar = useStore((state) => state.userAvatar)
	const orgName = useStore((state) => state.orgName)
	const rateLimitTimeReset = useStore((state) => state.rateLimitTimeReset)
	const rateLimitRemaining = useStore((state) => state.rateLimitRemaining)
	const rateLimit = useStore((state) => state.rateLimit)
	const nowPerMinute = useStore((state) => state.nowPerMinute)
	const isMd = useStore((state) => state.isMd)

	return (
		<div className="flex h-full flex-col">
			<div className="min-h-0 flex-1">{children}</div>

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
							<Link2 href={`https://github.com/${orgName}/diori-main`}>
								{orgName}
							</Link2>
						</div>
					)}
				</div>

				<div className="flex gap-4 align-middle">
					<div className="xs:hidden">{dayjs().format('HH:mm:ss.SSS')}</div>

					{rateLimitTimeReset && (
						<>
							{isMd && (
								<div>
									Giới hạn API: Còn lại {rateLimitRemaining} / {rateLimit}, đặt
									lại sau {rateLimitTimeReset.from(nowPerMinute, true)}
								</div>
							)}
							{!isMd && (
								<div>
									{rateLimitRemaining} / {rateLimit}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	)
}
