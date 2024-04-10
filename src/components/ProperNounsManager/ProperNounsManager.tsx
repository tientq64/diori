import { Button, Form, IndexBar, Input, List, Popup } from 'antd-mobile'
import { groupBy, isEqual, some, toPairs } from 'lodash'
import { useMemo, useState } from 'react'
import { TagsInput } from 'react-tag-input-component'
import { useSaveSettings } from '../../hooks/useSaveSettings'
import { ProperNoun } from '../../store/slices/settingsSlice'
import { useStore } from '../../store/useStore'
import { removeToneMarks } from '../../utils/removeToneMarks'

export function ProperNounsManager() {
	const store = useStore()
	const [form] = Form.useForm()
	const [editingProperNoun, setEditingProperNoun] = useState<ProperNoun | undefined>()
	const editingProperNounName = Form.useWatch<string>('name', form) ?? ''
	const editingProperNounAliasNames = Form.useWatch<string[]>('aliasNames', form) ?? []
	const editingProperNounDescription = Form.useWatch<string>('description', form) ?? ''
	const saveSettings = useSaveSettings()

	const groups = useMemo<[string, ProperNoun[]][]>(() => {
		const sortedProperNouns = store.properNouns.toSorted((properNounA, properNounB) => {
			return removeToneMarks(properNounA.name).localeCompare(
				removeToneMarks(properNounB.name)
			)
		})
		return toPairs(
			groupBy(sortedProperNouns, (properNoun) => removeToneMarks(properNoun.name[0]))
		)
	}, [store.properNouns])

	const isFormVisible = useMemo<boolean>(() => {
		return editingProperNoun !== undefined
	}, [editingProperNoun])

	const isEditingNewProperNoun = useMemo<boolean>(() => {
		if (!editingProperNoun) return true
		if (some(store.properNouns, { id: editingProperNoun.id })) return false
		return true
	}, [editingProperNoun?.id])

	const unsaved = useMemo<boolean>(() => {
		if (!editingProperNoun) return false
		if (editingProperNounName !== editingProperNoun.name) return true
		if (!isEqual(editingProperNounAliasNames, editingProperNoun.aliasNames)) return true
		if (editingProperNounDescription !== editingProperNoun.description) return true
		return false
	}, [
		editingProperNoun,
		editingProperNounName,
		editingProperNounAliasNames,
		editingProperNounDescription
	])

	const handleProperNounClick = (properNoun?: ProperNoun): void => {
		let id = 1
		while (some(store.properNouns, { id })) {
			id++
		}
		properNoun ??= {
			id,
			name: '',
			aliasNames: [],
			description: ''
		}
		form.setFieldsValue(properNoun)
		setEditingProperNoun(properNoun)
	}

	const handleRemoveProperNoun = (properNoun?: ProperNoun): void => {
		if (!properNoun) return
		store.removePerson(editingProperNoun)
		setEditingProperNoun(undefined)
	}

	const saveEditingProperNoun = (): void => {
		if (!editingProperNoun) return
		if (!unsaved) return
		const newProperNoun: ProperNoun = {
			id: editingProperNoun.id,
			name: editingProperNounName,
			aliasNames: editingProperNounAliasNames,
			description: editingProperNounDescription
		}
		store.addOrUpdateProperNoun(newProperNoun)
		setEditingProperNoun(undefined)
	}

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-hidden">
				<IndexBar>
					{groups.map(([letter, properNouns]) => (
						<IndexBar.Panel key={letter} index={letter}>
							<List>
								{properNouns.map((properNoun) => (
									<List.Item
										key={properNoun.id}
										clickable
										description={properNoun.aliasNames.join(', ')}
										extra={properNoun.description}
										onClick={() => handleProperNounClick(properNoun)}
									>
										{((splitedName) =>
											splitedName && (
												<div className="flex gap-1">
													{splitedName[1]}
													{splitedName[2] && (
														<div className="text-neutral-500">
															{splitedName[2]}
														</div>
													)}
												</div>
											))(properNoun.name.match(/^(.+?)( \(.*\))?$/))}
									</List.Item>
								))}
							</List>
						</IndexBar.Panel>
					))}
				</IndexBar>
			</div>

			<div className="flex px-4 py-2">
				<div className="flex-1"></div>

				<div className="flex-1 text-center">
					<Button onClick={() => handleProperNounClick()}>Thêm mới</Button>
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
				onClose={() => setEditingProperNoun(undefined)}
			>
				<Form
					form={form}
					mode="card"
					layout="horizontal"
					onFinish={() => saveEditingProperNoun()}
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
						<Input autoFocus={isEditingNewProperNoun} />
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
								input: 'h-7 bg-transparent placeholder:text-neutral-600',
								tag: '!whitespace-pre-wrap dark:!bg-neutral-700'
							}}
							isEditOnRemove
							beforeAddValidate={(tag) => tag.trim() !== ''}
							placeHolder="Nhập tên khác, nhấn Enter để thêm"
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

							{!isEditingNewProperNoun && (
								<Button
									color="danger"
									onClick={() => handleRemoveProperNoun(editingProperNoun)}
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
