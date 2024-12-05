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
		<div className="flex flex-col h-full">
			<div className="flex-1 min-h-0">{children}</div>

			<div className="flex justify-between align-middle px-4 py-1 text-sm bg-zinc-900/90 z-10">
				<div className="flex align-middle gap-4">
					{userName && (
						<div className="flex xs:hidden gap-3">
							<img className="w-5 h-5 rounded" src={userAvatar} alt="Ảnh đại diện" />
							<div className="flex gap-1">
								Tài khoản:
								<Link2 href="https://github.com/settings/tokens?type=beta">
									{userName}
								</Link2>
							</div>
						</div>
					)}

					{orgName && (
						<div className="flex xs:hidden gap-1">
							Tổ chức:
							<Link2 href={`https://github.com/${orgName}/diori-main`}>
								{orgName}
							</Link2>
						</div>
					)}
				</div>

				<div className="flex align-middle gap-4">
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
