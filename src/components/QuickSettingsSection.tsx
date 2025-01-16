import { Button, Form, Input, Slider, Switch } from 'antd-mobile'
import { SliderValue } from 'antd-mobile/es/components/slider'
import { range } from 'lodash'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useSaveSettings } from '../hooks/useSaveSettings'
import { useSyncSettings } from '../hooks/useSyncSettings'
import { useAppStore } from '../store/useAppStore'
import { formValidateMessages } from '../utils/formValidateMessages'
import { showConfirm } from '../utils/showConfirm'
import { Kbd } from './Kbd'

export function QuickSettingsSection(): ReactNode {
	const isMd = useAppStore((state) => state.isMd)
	const fontFamily = useAppStore((state) => state.fontFamily)
	const fontSize = useAppStore((state) => state.fontSize)
	const isDarkMode = useAppStore((state) => state.isDarkMode)
	const setFontFamily = useAppStore((state) => state.setFontFamily)
	const setFontSize = useAppStore((state) => state.setFontSize)
	const setIsDarkMode = useAppStore((state) => state.setIsDarkMode)

	const navigate = useNavigate()
	const [form] = Form.useForm()
	const saveSettingsApi = useSaveSettings()
	const syncSettingsApi = useSyncSettings()

	const initialValues = {
		fontFamily,
		fontSize,
		isDarkMode
	}

	const handleSaveSettings = (values: typeof initialValues): void => {
		setFontFamily(values.fontFamily)
	}

	const handleSyncSettingsFromGitHub = async (): Promise<void> => {
		const confirmed: boolean = await showConfirm({
			content: 'Bạn chắc chắn muốn đồng bộ cài đặt từ GitHub?',
			confirmText: 'Xác nhận',
			cancelText: 'Hủy'
		})
		if (!confirmed) return
		syncSettingsApi.run()
	}

	const handleSaveSettingsToGitHub = async (): Promise<void> => {
		const confirmed: boolean = await showConfirm({
			content: 'Bạn chắc chắn muốn lưu cài đặt lên GitHub?',
			confirmText: 'Xác nhận',
			cancelText: 'Hủy'
		})
		if (!confirmed) return
		saveSettingsApi.run()
	}

	return (
		<div>
			<Form
				className="xs:adm-form-card-m0"
				form={form}
				mode="card"
				layout={isMd ? 'horizontal' : 'vertical'}
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
							fontFamily: `${form.getFieldValue('fontFamily')}, ${fontFamily}`
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
						onChange={setFontSize as (fontSize: SliderValue) => void}
					/>
				</Form.Item>

				<Form.Item
					label="Chế độ tối"
					name="isDarkMode"
					valuePropName="checked"
					layout="horizontal"
					childElementPosition={isMd ? 'normal' : 'right'}
				>
					<Switch onChange={setIsDarkMode} />
				</Form.Item>

				<Form.Item className="text-center">
					<div className="pb-4 text-center text-sm text-zinc-500">
						Có thể nhấn <Kbd>Enter</Kbd> để áp dụng thay đổi khi đang gõ đối với các
						trường văn bản.
					</div>

					<div className="flex justify-center gap-2 xs:flex-wrap">
						<Button type="submit" color="primary">
							{isMd ? 'Áp dụng cài đặt' : 'Áp dụng c.đặt'}
						</Button>

						<Button disabled onClick={() => navigate('/settings')}>
							{isMd ? 'Cài đặt khác' : 'C.đặt khác'}
						</Button>

						<Button
							disabled={syncSettingsApi.loading || saveSettingsApi.loading}
							onClick={handleSyncSettingsFromGitHub}
						>
							{isMd ? 'Đồng bộ cài đặt từ GitHub' : 'Đ.bộ c.đặt từ Git'}
						</Button>

						<Button
							disabled={syncSettingsApi.loading || saveSettingsApi.loading}
							onClick={handleSaveSettingsToGitHub}
						>
							{isMd ? 'Lưu cài đặt lên GitHub' : 'Lưu c.đặt lên Git'}
						</Button>
					</div>
				</Form.Item>
			</Form>
		</div>
	)
}
