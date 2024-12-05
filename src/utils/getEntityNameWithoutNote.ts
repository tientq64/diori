/**
 * Lấy tên đối tượng không bao gồm ghi chú.
 * @param entityName Tên đối tượng.
 * @returns Tên đối tượng không bao gồm ghi chú.
 *
 * @example
 * getEntityNameWithoutNote('Thu (bạn thân)') // 'Thu'
 * getEntityNameWithoutNote('Chi') // 'Chi'
 */
export function getEntityNameWithoutNote(entityName: string): string {
	return entityName.replace(/ +\(.+\)$/, '')
}
