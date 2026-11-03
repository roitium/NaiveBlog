import type { ImgHTMLAttributes } from 'react'
import { withBase } from '@/utils/paths'

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
	src: string | { src: string; width?: number; height?: number }
	'data-src'?: string
}
// JSX islands use native images. Content images use Astro's image service.
export default function Image({ src, style, ...props }: ImageProps) {
	const image = typeof src === 'string' ? { src } : src
	return (
		<img
			width={image.width}
			height={image.height}
			{...props}
			src={withBase(image.src)}
			data-src={props['data-src'] ? withBase(props['data-src']) : undefined}
			loading={props.loading || 'lazy'}
			decoding='async'
			style={style}
		/>
	)
}
