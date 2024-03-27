import { PBKDF2 } from 'crypto-js'

self.addEventListener('message', (event) => {
	const pass = event.data
	const key = PBKDF2(pass, '3wyRZ6UJeYiAglFsu-cqG', {
		keySize: 16,
		iterations: 21045
	}).toString()
	self.postMessage(key)
})
