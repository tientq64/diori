import { Button, Form, IndexBar, Input, List, Popup } from 'antd-mobile'
import { groupBy, isEqual, maxBy, some, toPairs } from 'lodash'
import { nanoid } from 'nanoid'
import { useMemo, useState } from 'react'
import { TagsInput } from 'react-tag-input-component'
import { useSaveSettings } from '../../hooks/useSaveSettings'
import { Person } from '../../store/slices/settingsSlice'
import { useStore } from '../../store/useStore'
import { removeToneMarks } from '../../utils/removeToneMarks'

export function PersonsManager() {
	const store = useStore()
	const [form] = Form.useForm()
	const [editingPerson, setEditingPerson] = useState<Person | undefined>()
	const editingPersonName = Form.useWatch<string>('name', form) ?? ''
	const editingPersonAliasNames = Form.useWatch<string[]>('aliasNames', form) ?? []
	const editingPersonDescription = Form.useWatch<string>('description', form) ?? ''
	const saveSettings = useSaveSettings()

	const groups = useMemo<[string, Person[]][]>(() => {
		const sortedPersons = store.persons.toSorted((personA, personB) => {
			return removeToneMarks(personA.name).localeCompare(removeToneMarks(personB.name))
		})
		return toPairs(groupBy(sortedPersons, (person) => removeToneMarks(person.name[0])))
	}, [store.persons])

	const isFormVisible = useMemo<boolean>(() => {
		return editingPerson !== undefined
	}, [editingPerson])

	const isEditingNewPerson = useMemo<boolean>(() => {
		if (!editingPerson) return true
		if (some(store.persons, { id: editingPerson.id })) return false
		return true
	}, [editingPerson?.id])

	const unsaved = useMemo<boolean>(() => {
		if (!editingPerson) return false
		if (editingPersonName !== editingPerson.name) return true
		if (!isEqual(editingPersonAliasNames, editingPerson.aliasNames)) return true
		if (editingPersonDescription !== editingPerson.description) return true
		return false
	}, [editingPerson, editingPersonName, editingPersonAliasNames, editingPersonDescription])

	const handlePersonClick = (person?: Person): void => {
		let id = 1
		while (some(store.persons, { id })) {
			id++
		}
		person ??= {
			id,
			name: '',
			aliasNames: [],
			description: ''
		}
		form.setFieldsValue(person)
		setEditingPerson(person)
	}

	const saveEditingPerson = (): void => {
		if (!editingPerson) return
		if (!unsaved) return
		const newPerson: Person = {
			id: editingPerson.id,
			name: editingPersonName,
			aliasNames: editingPersonAliasNames,
			description: editingPersonDescription
		}
		store.addOrUpdatePerson(newPerson)
		setEditingPerson(undefined)
	}

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-hidden">
				<IndexBar>
					{groups.map(([letter, persons]) => (
						<IndexBar.Panel key={letter} index={letter}>
							<List>
								{persons.map((person) => (
									<List.Item
										key={person.id}
										clickable
										description={person.aliasNames.join(', ')}
										extra={person.description}
										onClick={() => handlePersonClick(person)}
									>
										{((splitedName) =>
											splitedName && (
												<div className="flex gap-1">
													{splitedName[1]}
													{splitedName[2] && (
														<div className="text-neutral-500">{splitedName[2]}</div>
													)}
												</div>
											))(person.name.match(/^(.+?)( \(.*\))?$/))}
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
					<Button onClick={() => handlePersonClick()}>Thêm mới</Button>
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
				onClose={() => setEditingPerson(undefined)}
			>
				<Form form={form} mode="card" layout="horizontal" onFinish={() => saveEditingPerson()}>
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
						<Input autoFocus={isEditingNewPerson} />
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

					<Form.Item className="text-center">
						<Button type="submit" color="primary" disabled={!unsaved}>
							Lưu
						</Button>
					</Form.Item>
				</Form>
			</Popup>
		</div>
	)
}
