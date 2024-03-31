export function intToRadix62(int: number): string {
	const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	let radix62 = ''
	while (int > 0) {
		radix62 = charset[int % charset.length] + radix62
		int = Math.floor(int / charset.length)
	}
	return radix62
}
