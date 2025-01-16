import { Dialog, DialogAlertProps } from 'antd-mobile'

type AlertProps = Pick<DialogAlertProps, 'title' | 'content' | 'confirmText'>

export function showAlert(props: AlertProps | string): Promise<void> {
	if (typeof props === 'string') {
		props = {
			content: props
		}
	}
	return Dialog.alert({
		bodyClassName: 'max-w-[32rem]',
		confirmText: 'OK',
		...props
	})
}
