import { describe, expect, test } from 'vitest'
import { base64ToText } from '../src/utils/base64ToText'
import { compressBase64 } from '../src/utils/compressBase64'
import { decompressBase64 } from '../src/utils/decompressBase64'
import { intToRadix62 } from '../src/utils/intToRadix62'
import { radix62ToInt } from '../src/utils/radix62ToInt'
import { removeToneMarks } from '../src/utils/removeToneMarks'
import { textToBase64 } from '../src/utils/textToBase64'
import dayjs, { Dayjs } from 'dayjs'
import { makePhotoFileName } from '../src/utils/makePhotoFileName'
import { makePhotoPath } from '../src/utils/makePhotoPath'

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
		expect(compressBase64('bmjAAhAAAAuq10AAAAAA/IGvvD+AAAAAAAAAAAAAAAvQ===')).toBe(
			'bmj.h~1uq10~3_IGvvD-~cvQ=~'
		)
	})

	test('decompressBase64', () => {
		expect(decompressBase64('')).toBe('')
		expect(decompressBase64('bmj.h~1uq10~3_IGvvD-~cvQ=~')).toBe(
			'bmjAAhAAAAuq10AAAAAA/IGvvD+AAAAAAAAAAAAAAAvQ==='
		)
	})

	test('removeToneMarks', () => {
		expect(removeToneMarks('nhật ký')).toBe('nhât ky')
	})

	{
		const noteTime: Dayjs = dayjs('2024-10-05')

		test('makePhotoFileName', () => {
			expect(makePhotoFileName(noteTime, 'c5kJxW')).toBe('20241005-c5kJxW.webp')
		})

		test('makePhotoPath', () => {
			expect(makePhotoPath(noteTime, 'c5kJxW')).toBe('10/05/20241005-c5kJxW.webp')
		})
	}
})
