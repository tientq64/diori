import { Dropdown } from 'antd-mobile'
import { PersonsManager } from '../PersonsManager/PersonsManager'

export function PersonsManagerDropdown() {
	return (
		<Dropdown closeOnClickAway>
			<Dropdown.Item key="persons" title="Mọi người" destroyOnClose>
				<div className="h-[80vh]">
					<PersonsManager />
				</div>
			</Dropdown.Item>
		</Dropdown>
	)
}
