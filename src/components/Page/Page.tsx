import dayjs, { Dayjs } from 'dayjs'
import { ReactNode, useEffect, useState } from 'react'
import { useStore } from '../../store/useStore'

type PageProps = {
	children: ReactNode
}

export function Page({ children }: PageProps) {
	const store = useStore()
	const [now, setNow] = useState<Dayjs>(dayjs())

	useEffect(() => {
		const intervalId = setInterval(() => {
			setNow(dayjs())
		})

		return () => {
			clearInterval(intervalId)
		}
	}, [now])

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 min-h-0">{children}</div>

			<div className="flex justify-between align-middle px-4 py-1 outline outline-1 outline-gray-200 dark:outline-neutral-700">
				<div className="flex align-middle gap-4">
					{store.userName && (
						<div className="flex gap-3">
							<img
								className="h-5 rounded"
								src={store.userAvatar}
								alt="Ảnh đại diện"
							/>
							Tài khoản: {store.userName}
						</div>
					)}

					{store.orgName && (
						<div>
							Tổ chức: {}
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
					{store.rateLimitTimeReset && (
						<div>
							Giới hạn API: Còn lại {store.rateLimitRemaining} / {store.rateLimit},
							đặt lại sau {store.rateLimitTimeReset.from(now, true)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
