import { Dropdown } from 'antd-mobile'
import { useStore } from '../../store/useStore'
import { QuickSettingsSection } from '../QuickSettingsSection/QuickSettingsSection'

export function QuickSettingsDropdown() {
	const store = useStore()

	return (
		<Dropdown closeOnClickAway arrow={store.isMd ? undefined : false}>
			<Dropdown.Item key="setting" title="Cài đặt" destroyOnClose>
				<QuickSettingsSection />
			</Dropdown.Item>
		</Dropdown>
	)
}
