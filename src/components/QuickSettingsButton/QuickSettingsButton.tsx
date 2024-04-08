import { Dropdown } from 'antd-mobile'
import { QuickSettingsSection } from '../QuickSettingsSection/QuickSettingsSection'

export function QuickSettingsButton() {
	return (
		<Dropdown closeOnClickAway>
			<Dropdown.Item key="setting" title="Cài đặt" destroyOnClose>
				<QuickSettingsSection />
			</Dropdown.Item>
		</Dropdown>
	)
}
