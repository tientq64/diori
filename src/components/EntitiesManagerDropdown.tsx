import { Dropdown } from 'antd-mobile'
import { EntitiesManager } from './EntitiesManager'

export function EntitiesManagerDropdown() {
	return (
		<Dropdown closeOnClickAway>
			<Dropdown.Item key="entities" title="Đối tượng" destroyOnClose>
				<EntitiesManager />
			</Dropdown.Item>
		</Dropdown>
	)
}
