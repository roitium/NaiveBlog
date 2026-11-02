import type { ImgHTMLAttributes } from 'react'
import { withBase } from '@/utils/paths'

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
	src: string | { src: string; width?: number; height?: number }
	'data-src'?: string
	priority?: boolean
	fill?: boolean
}
// JSX islands use native images. Content images use Astro's image service.
export default function Image({
	src,
	priority,
	fill,
	style,
	...props
}: ImageProps) {
	const image = typeof src === 'string' ? { src } : src
	return (
		<img
			width={image.width}
			height={image.height}
			{...props}
			src={withBase(image.src)}
			data-src={props['data-src'] ? withBase(props['data-src']) : undefined}
			loading={priority ? 'eager' : props.loading || 'lazy'}
			decoding='async'
			fetchPriority={priority ? 'high' : undefined}
			style={
				fill
					? {
							position: 'absolute',
							inset: 0,
							width: '100%',
							height: '100%',
							...style,
						}
					: style
			}
		/>
	)
}
