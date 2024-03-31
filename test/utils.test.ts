import { describe, expect, test } from 'vitest'
import { base64ToMinBase64 } from '../src/utils/base64ToMinBase64'
import { base64ToText } from '../src/utils/base64ToText'
import { intToRadix62 } from '../src/utils/intToRadix62'
import { minBase64ToBase64 } from '../src/utils/minBase64ToBase64'
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
		expect(intToRadix62(3)).toBe('3')
		expect(intToRadix62(11)).toBe('b')
		expect(intToRadix62(1047)).toBe('gT')
		expect(intToRadix62(16000)).toBe('4a4')
	})

	test('radix62ToInt', () => {
		expect(radix62ToInt('3')).toBe(3)
		expect(radix62ToInt('b')).toBe(11)
		expect(radix62ToInt('gT')).toBe(1047)
		expect(radix62ToInt('4a4')).toBe(16000)
	})

	test('base64ToMinBase64', () => {
		expect(base64ToMinBase64('')).toBe('')
		expect(base64ToMinBase64('bmjAAhAAAAuq10AAAAAAIGvDAAAAAAAAAAAAAAAvQ==')).toBe(
			"bmj'h^uq10-3IGvD-cvQ=="
		)
	})

	test('minBase64ToBase64', () => {
		expect(minBase64ToBase64('')).toBe('')
		expect(minBase64ToBase64("bmj'h^uq10-3IGvD-cvQ==")).toBe(
			'bmjAAhAAAAuq10AAAAAAIGvDAAAAAAAAAAAAAAAvQ=='
		)
	})
})
