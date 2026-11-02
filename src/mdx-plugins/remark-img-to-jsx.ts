import fs from 'node:fs'
import path from 'node:path'
import { imageSize } from 'image-size'
import type { Root, Image } from 'mdast'
import { visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

/** Preserve image dimensions and gallery URLs in both Markdown and MDX. */
export function remarkImgToJsx({ base = '' }: { base?: string } = {}) {
	return (tree: Root, file: VFile) => {
		visit(tree, 'image', (node: Image) => {
			const imagePath = path.resolve('public', `.${node.url}`)
			const publicRoot = `${path.resolve('public')}${path.sep}`
			if (!imagePath.startsWith(publicRoot) || !fs.existsSync(imagePath)) return
			const dimensions = imageSize(fs.readFileSync(imagePath))
			if (file.extname === '.md') {
				node.data = {
					...node.data,
					hProperties: {
						...node.data?.hProperties,
						width: dimensions.width,
						height: dimensions.height,
						'data-src': `${base.replace(/\/$/, '')}${node.url}`,
						src: `${base.replace(/\/$/, '')}${node.url}`,
						loading: 'lazy',
					},
				}
				return
			}
			Object.assign(node, {
				type: 'mdxJsxTextElement',
				name: 'Image',
				children: [],
				attributes: Object.entries({
					src: node.url,
					alt: node.alt || '',
					width: dimensions.width,
					height: dimensions.height,
					'data-src': node.url,
				}).map(([name, value]) => ({
					type: 'mdxJsxAttribute',
					name,
					value: String(value),
				})),
			})
		})
	}
}
