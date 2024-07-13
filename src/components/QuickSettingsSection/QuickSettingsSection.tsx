import { Button, Form, Input, Slider, Space, Switch } from 'antd-mobile'
import { confirm } from 'antd-mobile/es/components/dialog/confirm'
import { SliderValue } from 'antd-mobile/es/components/slider'
import { range } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { useSaveSettings } from '../../hooks/useSaveSettings'
import { useSyncSettings } from '../../hooks/useSyncSettings'
import { useStore } from '../../store/useStore'
import { formValidateMessages } from '../../utils/formValidateMessages'
import { Kbd } from '../Kbd/Kbd'

export function QuickSettingsSection() {
	const navigate = useNavigate()
	const store = useStore()
	const [form] = Form.useForm()
	const fontFamily = Form.useWatch('fontFamily', form)
	const saveSettings = useSaveSettings()
	const syncSettings = useSyncSettings()

	const initialValues = {
		fontFamily: store.fontFamily,
		fontSize: store.fontSize,
		isDarkMode: store.isDarkMode
	}

	const handleSaveSettings = (values: typeof initialValues): void => {
		store.setFontFamily(values.fontFamily)
	}

	const handleSyncSettingsFromGitHub = async (): Promise<void> => {
		const confirmed: boolean = await confirm({
			content: 'Bạn chắc chắn muốn đồng bộ cài đặt từ GitHub?',
			confirmText: 'Xác nhận',
			cancelText: 'Hủy'
		})
		if (confirmed) {
			syncSettings.run()
		}
	}

	const handleSaveSettingsToGitHub = async (): Promise<void> => {
		const confirmed: boolean = await confirm({
			content: 'Bạn chắc chắn muốn lưu cài đặt lên GitHub?',
			confirmText: 'Xác nhận',
			cancelText: 'Hủy'
		})
		if (confirmed) {
			saveSettings.run()
		}
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
						onChange={store.setFontSize as (fontSize: SliderValue) => void}
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
							Áp dụng cài đặt
						</Button>

						<Button disabled onClick={() => navigate('/settings')}>
							Cài đặt khác
						</Button>

						<Button
							disabled={syncSettings.loading || saveSettings.loading}
							onClick={handleSyncSettingsFromGitHub}
						>
							Đồng bộ cài đặt từ GitHub
						</Button>

						<Button
							disabled={syncSettings.loading || saveSettings.loading}
							onClick={handleSaveSettingsToGitHub}
						>
							Lưu cài đặt lên GitHub
						</Button>
					</Space>
				</Form.Item>
			</Form>
		</div>
	)
}
