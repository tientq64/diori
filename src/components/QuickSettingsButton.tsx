import { Divider, Dropdown } from 'antd-mobile'
import { ReactNode } from 'react'
import { useAppStore } from '../store/useAppStore'
import { QuickSettingsSection } from './QuickSettingsSection'

export function QuickSettingsButton(): ReactNode {
	const isMd = useAppStore((state) => state.isMd)

	return (
		<Dropdown closeOnClickAway arrow={isMd ? undefined : false}>
			<Dropdown.Item key="setting" title="Cài đặt" destroyOnClose>
				<QuickSettingsSection />

				<Divider className="m-0" />
			</Dropdown.Item>
		</Dropdown>
	)
}
