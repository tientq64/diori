import { NavBar } from 'antd-mobile'
import { PersonsManager } from '../../components/PersonsManager/PersonsManager'

export function PersonsPage() {
	return (
		<div className="flex flex-col h-full">
			<NavBar>Mọi người</NavBar>

			<div className="flex-1 overflow-hidden">
				<PersonsManager />
			</div>
		</div>
	)
}
