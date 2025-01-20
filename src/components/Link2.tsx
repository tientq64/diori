import clsx from 'clsx'
import { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link, LinkProps } from 'react-router'

const defaultLinkClassName: string =
	'hover:underline underline-offset-2 decoration-2 decoration-dotted text-blue-400 light:text-blue-600 decoration-skip-ink-none'

type LinkProps2 = AnchorHTMLAttributes<HTMLAnchorElement> | LinkProps

/**
 * Component link. Nếu sử dụng thuộc tính `to`, sẽ sử dụng component `Link` của "react-router", còn
 * không sẽ như tag `a` bình thường, nhưng sẽ mở tab mới khi click vào theo mặc định.
 */
export function Link2(props: LinkProps2): ReactNode {
	return 'to' in props ? (
		<Link {...props} className={clsx(defaultLinkClassName, props.className)} />
	) : (
		<a
			{...props}
			className={clsx(defaultLinkClassName, props.className)}
			target={props.target ?? '_blank'}
		/>
	)
}
