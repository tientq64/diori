import { Divider, Dropdown } from 'antd-mobile'
import { ReactNode } from 'react'
import { EntitiesManager } from './EntitiesManager'

export function EntitiesManagerButton(): ReactNode {
	return (
		<Dropdown closeOnClickAway>
			<Dropdown.Item key="entities" title="Đối tượng" destroyOnClose>
				<EntitiesManager />

				<Divider className="m-0" />
			</Dropdown.Item>
		</Dropdown>
	)
}
