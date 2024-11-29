export const radix62Charset: string =
	'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function intToRadix62(int: number): string {
	let radix62: string = ''
	while (int > 0) {
		radix62 = radix62Charset[int % radix62Charset.length] + radix62
		int = Math.floor(int / radix62Charset.length)
	}
	return radix62 || '0'
}
