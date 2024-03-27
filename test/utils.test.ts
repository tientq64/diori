import { expect, test, describe } from 'vitest'
import { textToBase64 } from '../src/utils/textToBase64'

describe('utils', () => {
	test('text to base64', () => {
		expect(textToBase64('nhật ký')).toBe('bmjhuq10IGvDvQ==')
		expect(textToBase64('')).toBe('')
	})
})
