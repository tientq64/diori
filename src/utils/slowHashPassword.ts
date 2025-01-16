import slowHashPasswordWorker from '../workers/slowHashPasswordWorker?worker'

export function slowHashPassword(pass: string, registerSalt: string): Promise<string> {
	return new Promise((resolve) => {
		const salt: string = '3wyRZ6UJeYiAglFsu-cqG' + registerSalt

		const worker: Worker = new slowHashPasswordWorker()
		worker.addEventListener('message', (event: MessageEvent<string>): void => {
			worker.terminate()
			resolve(event.data)
		})
		worker.postMessage([pass, salt])
	})
}
