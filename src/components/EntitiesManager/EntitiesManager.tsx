import {
	Button,
	CapsuleTabs,
	Dialog,
	ErrorBlock,
	Form,
	IndexBar,
	Input,
	List,
	Popup,
	Radio,
	Space
} from 'antd-mobile'
import { filter, groupBy, isEqual, some, toPairs } from 'lodash'
import { useMemo, useState } from 'react'
import { TagsInput } from 'react-tag-input-component'
import { useSaveSettings } from '../../hooks/useSaveSettings'
import { Entity, EntityTypes } from '../../store/slices/settingsSlice'
import { useStore } from '../../store/useStore'
import { removeToneMarks } from '../../utils/removeToneMarks'

export function EntitiesManager() {
	const store = useStore()
	const [form] = Form.useForm()
	const [editingEntity, setEditingEntity] = useState<Entity | undefined>()
	const editingEntityName = Form.useWatch<string>('name', form) ?? ''
	const editingEntityType = Form.useWatch<EntityTypes>('type', form) ?? 'person'
	const editingEntityAliasNames = Form.useWatch<string[]>('aliasNames', form) ?? []
	const editingEntityDescription = Form.useWatch<string>('description', form) ?? ''
	const saveSettings = useSaveSettings()
	const [filteredEntityType, setFilteredEntityType] = useState<EntityTypes | ''>('')

	const isFormVisible = useMemo<boolean>(() => {
		return editingEntity !== undefined
	}, [editingEntity])

	const isEditingNewEntity = useMemo<boolean>(() => {
		if (!editingEntity) return true
		if (some(store.entities, { id: editingEntity.id })) return false
		return true
	}, [editingEntity?.id])

	const filteredEntities = useMemo<Entity[]>(() => {
		if (filteredEntityType === '') {
			return store.entities
		}
		return filter(store.entities, { type: filteredEntityType })
	}, [store.entities, filteredEntityType])

	const groups = useMemo<[string, Entity[]][]>(() => {
		const sortedEntities = filteredEntities.toSorted((entityA, entityB) => {
			return removeToneMarks(entityA.name).localeCompare(removeToneMarks(entityB.name))
		})
		return toPairs(groupBy(sortedEntities, (entity) => removeToneMarks(entity.name[0])))
	}, [store.entities, filteredEntities])

	const unsaved = useMemo<boolean>(() => {
		if (!editingEntity) return false
		if (editingEntityName !== editingEntity.name) return true
		if (editingEntityType !== editingEntity.type) return true
		if (!isEqual(editingEntityAliasNames, editingEntity.aliasNames)) return true
		if (editingEntityDescription !== editingEntity.description) return true
		return false
	}, [
		editingEntity,
		editingEntityName,
		editingEntityType,
		editingEntityAliasNames,
		editingEntityDescription
	])

	const handleEntityClick = (entity?: Entity): void => {
		let id = 1
		while (some(store.entities, { id })) {
			id++
		}
		entity ??= {
			id,
			type: filteredEntityType || EntityTypes.PERSON,
			name: '',
			aliasNames: [],
			description: ''
		}
		form.setFieldsValue(entity)
		setEditingEntity(entity)
	}

	const handleRemoveEntity = async (entity?: Entity): Promise<void> => {
		if (!entity) return
		const isConfirmedRemove: boolean = await Dialog.confirm({
			title: 'Xác nhận xóa',
			content: `Bạn chắc chắn muốn xóa "${entity.name}"?`,
			confirmText: 'Xóa',
			cancelText: 'Không'
		})
		if (isConfirmedRemove) {
			store.removeEntity(editingEntity)
			setEditingEntity(undefined)
		}
	}

	const handleFilteredEntityTypeChange = (key: string): void => {
		setFilteredEntityType(key as EntityTypes)
	}

	const saveEditingEntity = (): void => {
		if (!editingEntity) return
		if (!unsaved) return
		const newEntity: Entity = {
			id: editingEntity.id,
			type: editingEntityType,
			name: editingEntityName,
			aliasNames: editingEntityAliasNames,
			description: editingEntityDescription
		}
		store.addOrUpdateEntity(newEntity)
		setEditingEntity(undefined)
	}

	return (
		<div className="flex flex-col h-[80vh]">
			<CapsuleTabs activeKey={filteredEntityType} onChange={handleFilteredEntityTypeChange}>
				<CapsuleTabs.Tab title="Tất cả" key="" />
				<CapsuleTabs.Tab title="Mọi người" key={EntityTypes.PERSON} />
				<CapsuleTabs.Tab title="Danh từ riêng" key={EntityTypes.PROPER_NOUN} />
			</CapsuleTabs>

			<div className="flex-1 overflow-hidden">
				{groups.length === 0 && (
					<div className="flex justify-center items-center h-full">
						<ErrorBlock
							className="py-4"
							status="empty"
							title="Chưa có đối tượng nào"
							description="Đối tượng có thể là tên người, địa điểm, nhãn hiệu, vv..."
						/>
					</div>
				)}

				{groups.length > 0 && (
					<IndexBar>
						{groups.map(([letter, entities]) => (
							<IndexBar.Panel key={letter} index={letter}>
								<List>
									{entities.map((entity) => (
										<List.Item
											key={entity.id}
											clickable
											description={entity.aliasNames.join(', ')}
											extra={entity.description}
											onClick={() => handleEntityClick(entity)}
										>
											{((splitedName) => {
												return (
													splitedName && (
														<div className="flex gap-1">
															{splitedName[1]}
															{splitedName[2] && (
																<div className="text-zinc-500">
																	{splitedName[2]}
																</div>
															)}
														</div>
													)
												)
											})(entity.name.match(/^(.+?)( \(.*\))?$/))}
										</List.Item>
									))}
								</List>
							</IndexBar.Panel>
						))}
					</IndexBar>
				)}
			</div>

			<div className="flex px-4 py-2">
				<div className="flex-1"></div>

				<div className="flex-1 text-center">
					<Button onClick={() => handleEntityClick()}>Thêm mới</Button>
				</div>

				<div className="flex-1 text-right">
					<Button disabled={saveSettings.loading} onClick={() => saveSettings.run()}>
						Lưu cài đặt lên GitHub
					</Button>
				</div>
			</div>

			<Popup
				visible={isFormVisible}
				showCloseButton
				closeOnMaskClick={!unsaved}
				destroyOnClose
				onClose={() => setEditingEntity(undefined)}
			>
				<Form
					form={form}
					mode="card"
					layout="horizontal"
					onFinish={() => saveEditingEntity()}
				>
					<Form.Item
						label="Tên"
						name="name"
						rules={[
							{
								max: 120,
								whitespace: true,
								required: true
							}
						]}
					>
						<Input autoFocus={isEditingNewEntity} />
					</Form.Item>

					<Form.Item label="Loại" name="type" required>
						<Radio.Group>
							<Space>
								<Radio value={EntityTypes.PERSON}>Tên người</Radio>
								<Radio value={EntityTypes.PROPER_NOUN}>Danh từ riêng</Radio>
							</Space>
						</Radio.Group>
					</Form.Item>

					<Form.Item
						label="Các tên khác"
						name="aliasNames"
						rules={[
							{
								type: 'array',
								max: 100
							}
						]}
					>
						<TagsInput
							classNames={{
								input: 'h-7 bg-transparent placeholder:text-zinc-600',
								tag: '!whitespace-pre-wrap dark:!bg-zinc-700'
							}}
							isEditOnRemove
							beforeAddValidate={(tag) => tag.trim() !== ''}
							placeHolder="Nhập vào đây, nhấn Enter để thêm"
						/>
					</Form.Item>

					<Form.Item
						label="Mô tả"
						name="description"
						rules={[
							{
								max: 1000,
								whitespace: true
							}
						]}
					>
						<Input />
					</Form.Item>

					<Form.Item>
						<div className="flex justify-center gap-2">
							<Button type="submit" color="primary" disabled={!unsaved}>
								Lưu
							</Button>

							{!isEditingNewEntity && (
								<Button
									color="danger"
									onClick={() => handleRemoveEntity(editingEntity)}
								>
									Xóa
								</Button>
							)}
						</div>
					</Form.Item>
				</Form>
			</Popup>
		</div>
	)
}
