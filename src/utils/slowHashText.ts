import SlowHashTextWorker from '../workers/slowHashTextWorker?worker'

export function slowHashText(pass: string): Promise<string> {
	return new Promise((resolve) => {
		const worker = new SlowHashTextWorker()
		worker.addEventListener('message', (event) => {
			worker.terminate()
			resolve(event.data)
		})
		worker.postMessage(pass)
	})
}
