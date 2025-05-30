import { NoteEdit, NoteEditJSON } from '../store/slices/editingSlice'

export function stringifyNoteEdit(noteEdit: NoteEdit): string {
	/**
	 * Nhật ký được tối ưu hóa, loại bỏ các giá trị không cần thiết giúp dữ liệu nhỏ gọn
	 * hơn.
	 */
	const noteEditData: NoteEditJSON = {
		date: noteEdit.date,
		title: noteEdit.title || undefined,
		isTitled: noteEdit.isTitled || undefined,
		content: noteEdit.content,
		photos: noteEdit.photos.length > 0 ? noteEdit.photos : undefined,
		defaultPhotoKey:
			noteEdit.photos.length >= 2 ? noteEdit.defaultPhotoKey : undefined
	}

	return JSON.stringify(noteEditData)
}
