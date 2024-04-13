import { Button, Form, Input, Slider, Space, Switch } from 'antd-mobile'
import { range } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { formValidateMessages } from '../../utils/formValidateMessages'
import { Kbd } from '../Kbd/Kbd'

export function QuickSettingsSection() {
	const navigate = useNavigate()
	const store = useStore()
	const [form] = Form.useForm()
	const fontFamily = Form.useWatch('fontFamily', form)

	const initialValues = {
		fontFamily: store.fontFamily,
		fontSize: store.fontSize,
		isDarkMode: store.isDarkMode
	}

	const handleSaveSettings = (values: typeof initialValues): void => {
		store.setFontFamily(values.fontFamily)
	}

	return (
		<div>
			<Form
				form={form}
				mode="card"
				layout={store.isMd ? 'horizontal' : 'vertical'}
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
						marks={Object.fromEntries(
							range(10, 21).map((fontSize) => [fontSize, fontSize])
						)}
						onChange={store.setFontSize as any}
					/>
				</Form.Item>

				<Form.Item
					label="Chế độ tối"
					name="isDarkMode"
					valuePropName="checked"
					layout="horizontal"
					childElementPosition={store.isMd ? 'normal' : 'right'}
				>
					<Switch onChange={store.setIsDarkMode} />
				</Form.Item>

				<Form.Item className="text-center">
					<div className="pb-4 text-center text-sm text-zinc-500">
						Có thể nhấn <Kbd>Enter</Kbd> để áp dụng thay đổi khi đang gõ đối với các
						trường văn bản.
					</div>

					<Space>
						<Button type="submit" color="primary" disabled={store.isXs}>
							Lưu cài đặt
						</Button>

						<Button onClick={() => navigate('/settings')}>Cài đặt khác</Button>
					</Space>
				</Form.Item>
			</Form>
		</div>
	)
}
