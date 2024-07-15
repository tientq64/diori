import { Dropdown } from 'antd-mobile'
import { useStore } from '../../store/useStore'
import { EntitiesManager } from '../EntitiesManager/EntitiesManager'

export function EntitiesManagerDropdown() {
	const store = useStore()

	return (
		<Dropdown closeOnClickAway>
			<Dropdown.Item key="entities" title="Đối tượng" destroyOnClose>
				<EntitiesManager />
			</Dropdown.Item>
		</Dropdown>
	)
}
