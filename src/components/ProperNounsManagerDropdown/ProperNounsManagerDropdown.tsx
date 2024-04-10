import { Dropdown } from 'antd-mobile'
import { ProperNounsManager } from '../ProperNounsManager/ProperNounsManager'

export function ProperNounsManagerDropdown() {
	return (
		<Dropdown closeOnClickAway>
			<Dropdown.Item key="properNouns" title="Tên riêng" destroyOnClose>
				<div className="h-[80vh]">
					<ProperNounsManager />
				</div>
			</Dropdown.Item>
		</Dropdown>
	)
}
