import { lib, PBKDF2 } from 'crypto-js'

self.addEventListener('message', (event: MessageEvent<[string, string]>): void => {
	const [pass, salt] = event.data

	const wordArray: lib.WordArray = PBKDF2(pass, salt, {
		keySize: 16,
		iterations: 21045
	})
	const key: string = wordArray.toString()

	self.postMessage(key)
})
