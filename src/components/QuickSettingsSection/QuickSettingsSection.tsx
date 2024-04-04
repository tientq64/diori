import { Button, Form, Input, Slider, Switch } from 'antd-mobile'
import { range } from 'lodash'
import { useStore } from '../../store/useStore'
import { formValidateMessages } from '../../utils/formValidateMessages'
import { Kbd } from '../Kbd/Kbd'

export function QuickSettingsSection() {
	const store = useStore()
	const [form] = Form.useForm()
	const fontFamily = Form.useWatch('fontFamily', form)

	const initialValues = {
		fontFamily: store.fontFamily,
		fontSize: store.fontSize,
		isDarkMode: store.isDarkMode
	}

	const handleSaveSettings = (values: typeof initialValues) => {
		store.setFontFamily(values.fontFamily)
	}

	return (
		<Form
			form={form}
			mode="card"
			layout="horizontal"
			initialValues={initialValues}
			validateMessages={formValidateMessages}
			onFinish={handleSaveSettings}
		>
			<Form.Item
				label="Phông chữ"
				name="fontFamily"
				rules={[
					{
						whitespace: true,
						required: true
					}
				]}
			>
				<Input
					style={{
						fontFamily: `${fontFamily}, ${store.fontFamily}`
					}}
				/>
			</Form.Item>

			<Form.Item label="Cỡ chữ" name="fontSize">
				<Slider
					popover
					min={10}
					max={20}
					marks={Object.fromEntries(range(10, 21).map((fontSize) => [fontSize, fontSize + 'px']))}
					onChange={store.setFontSize as any}
				/>
			</Form.Item>

			<Form.Item label="Chế độ tối" name="isDarkMode" valuePropName="checked">
				<Switch onChange={store.setIsDarkMode} />
			</Form.Item>

			<Form.Item className="text-center">
				<div className=" text-sm text-neutral-500">
					Có thể nhấn <Kbd>Enter</Kbd> để áp dụng thay đổi khi đang gõ đối với các trường văn bản.
				</div>
			</Form.Item>

			<Form.Item className="text-center">
				<Button type="submit" color="primary">
					Lưu cài đặt
				</Button>
			</Form.Item>
		</Form>
	)
}