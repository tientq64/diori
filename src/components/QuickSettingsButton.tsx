import { Dropdown } from 'antd-mobile'
import { ReactNode } from 'react'
import { useStore } from '../store/useStore'
import { QuickSettingsSection } from './QuickSettingsSection'

export function QuickSettingsButton(): ReactNode {
	const store = useStore()

	return (
		<Dropdown closeOnClickAway arrow={store.isMd ? undefined : false}>
			<Dropdown.Item key="setting" title="Cài đặt" destroyOnClose>
				<QuickSettingsSection />
			</Dropdown.Item>
		</Dropdown>
	)
}
