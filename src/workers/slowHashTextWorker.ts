import { lib, PBKDF2 } from 'crypto-js'

const salt: string = '3wyRZ6UJeYiAglFsu-cqG'

self.addEventListener('message', (event: MessageEvent<string>): void => {
	const pass: string = event.data
	const wordArray: lib.WordArray = PBKDF2(pass, salt, {
		keySize: 16,
		iterations: 21045
	})
	const key: string = wordArray.toString()
	self.postMessage(key)
})
