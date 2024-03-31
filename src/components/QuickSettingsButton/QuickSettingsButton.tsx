import { Dropdown } from 'antd-mobile'
import { QuickSettingsSection } from '../QuickSettingsSection/QuickSettingsSection'

export function QuickSettingsButton() {
	return (
		<Dropdown>
			<Dropdown.Item key="setting" title="Cài đặt">
				<QuickSettingsSection />
			</Dropdown.Item>
		</Dropdown>
	)
}
