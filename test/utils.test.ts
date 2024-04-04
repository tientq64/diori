import { describe, expect, test } from 'vitest'
import { compressBase64 } from '../src/utils/compressBase64'
import { base64ToText } from '../src/utils/base64ToText'
import { intToRadix62 } from '../src/utils/intToRadix62'
import { decompressBase64 } from '../src/utils/decompressBase64'
import { radix62ToInt } from '../src/utils/radix62ToInt'
import { textToBase64 } from '../src/utils/textToBase64'

describe('utils', () => {
	test('textToBase64', () => {
		expect(textToBase64('')).toBe('')
		expect(textToBase64('nhật ký')).toBe('bmjhuq10IGvDvQ==')
	})

	test('base64ToText', () => {
		expect(base64ToText('')).toBe('')
		expect(base64ToText('bmjhuq10IGvDvQ==')).toBe('nhật ký')
	})

	test('intToRadix62', () => {
		expect(intToRadix62(0)).toBe('0')
		expect(intToRadix62(3)).toBe('3')
		expect(intToRadix62(11)).toBe('b')
		expect(intToRadix62(1047)).toBe('gT')
		expect(intToRadix62(16000)).toBe('4a4')
	})

	test('radix62ToInt', () => {
		expect(radix62ToInt('0')).toBe(0)
		expect(radix62ToInt('3')).toBe(3)
		expect(radix62ToInt('b')).toBe(11)
		expect(radix62ToInt('gT')).toBe(1047)
		expect(radix62ToInt('4a4')).toBe(16000)
	})

	test('compressBase64', () => {
		expect(compressBase64('')).toBe('')
		expect(compressBase64('bmjAAhAAAAuq10AAAAAA/IGvvD+AAAAAAAAAAAAAAAvQ===')).toBe('䢶䵃䱟卄㒎缡㸌磕嚥㕕䋯埂')
	})

	test('decompressBase64', () => {
		expect(decompressBase64('')).toBe('')
		expect(decompressBase64('䢶䵃䱟卄㒎缡㸌磕嚥㕕䋯埂')).toBe('bmjAAhAAAAuq10AAAAAA/IGvvD+AAAAAAAAAAAAAAAvQ===')
	})
})
