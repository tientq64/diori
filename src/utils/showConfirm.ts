import { Dialog, DialogConfirmProps } from 'antd-mobile'

type ConfirmProps = Pick<DialogConfirmProps, 'title' | 'content' | 'confirmText' | 'cancelText'>

export function showConfirm(props: ConfirmProps | string): Promise<boolean> {
	if (typeof props === 'string') {
		props = {
			content: props
		}
	}
	return Dialog.confirm({
		bodyClassName: 'max-w-[32rem]',
		confirmText: 'OK',
		cancelText: 'Hủy',
		...props
	})
}
