import dayjs from 'dayjs'
import { ReactNode } from 'react'
import { useStore } from '../../store/useStore'

type PageProps = {
	children: ReactNode
}

export function Page({ children }: PageProps) {
	const store = useStore()

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 min-h-0">{children}</div>

			<div className="flex justify-between align-middle px-4 py-1 outline outline-1 outline-zinc-200 dark:outline-zinc-700">
				<div className="flex align-middle gap-4">
					{store.userName && (
						<div className="flex xs:hidden gap-3">
							<img
								className="w-5 h-5 rounded"
								src={store.userAvatar}
								alt="Ảnh đại diện"
							/>
							<div className="flex gap-1">
								Tài khoản:
								<a
									href="https://github.com/settings/tokens?type=beta"
									target="_blank"
								>
									{store.userName}
								</a>
							</div>
						</div>
					)}

					{store.orgName && (
						<div className="flex xs:hidden gap-1">
							Tổ chức:
							<a
								href={`https://github.com/${store.orgName}/diori-main`}
								target="_blank"
							>
								{store.orgName}
							</a>
						</div>
					)}
				</div>

				<div className="flex align-middle gap-4">
					<div className="xs:hidden">{dayjs().format('HH:mm:ss.SSS')}</div>

					{store.rateLimitTimeReset &&
						(store.isMd ? (
							<div>
								Giới hạn API: Còn lại {store.rateLimitRemaining} / {store.rateLimit}
								, đặt lại sau{' '}
								{store.rateLimitTimeReset.from(store.nowPerMinute, true)}
							</div>
						) : (
							<div>
								{store.rateLimitRemaining} / {store.rateLimit}
							</div>
						))}
				</div>
			</div>
		</div>
	)
}
