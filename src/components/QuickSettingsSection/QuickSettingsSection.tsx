import { Form, Input, Slider, Switch } from 'antd-mobile'
import { range } from 'lodash'
import { useStore } from '../../store/useStore'

export function QuickSettingsSection() {
	const store = useStore()

	return (
		<Form mode="card" layout="horizontal">
			<Form.Item label="Phông chữ" name="fontFamily">
				<Input value={store.fontFamily} onChange={store.setFontFamily} />
			</Form.Item>

			<Form.Item label="Cỡ chữ" name="fontSize">
				<Slider
					popover
					min={10}
					max={20}
					marks={Object.fromEntries(
						range(10, 21).map((fontSize) => [fontSize, fontSize + 'px'])
					)}
					value={store.fontSize}
					onChange={store.setFontSize as any}
				/>
			</Form.Item>

			<Form.Item label="Chế độ tối" name="isDarkMode">
				<Switch checked={store.isDarkMode} onChange={store.setIsDarkMode} />
			</Form.Item>
		</Form>
	)
}
