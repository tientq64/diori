export function radix62ToInt(radix62: string): number {
	const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	let int = 0
	for (let letter of radix62) {
		int = int * charset.length + charset.indexOf(letter)
	}
	return int
}
