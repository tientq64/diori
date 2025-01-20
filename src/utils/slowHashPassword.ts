import slowHashPasswordWorker from '../workers/slowHashPasswordWorker?worker'

export function slowHashPassword(pass: string, salt: string): Promise<string> {
	return new Promise((resolve) => {
		const strongSalt: string = '3wyRZ6UJeYiAglFsu-cqG' + salt

		const worker: Worker = new slowHashPasswordWorker()
		worker.addEventListener('message', (event: MessageEvent<string>): void => {
			worker.terminate()
			resolve(event.data)
		})
		worker.postMessage([pass, strongSalt])
	})
}
