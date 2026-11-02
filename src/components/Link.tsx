import type { AnchorHTMLAttributes } from 'react'
import { withBase } from '@/utils/paths'

export default function Link({
	href = '',
	...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
	return (
		<a
			href={withBase(href)}
			{...props}
		/>
	)
}
