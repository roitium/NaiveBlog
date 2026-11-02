import path from 'node:path'
import remarkMediaCard from '@zhouhua-dev/remark-media-card'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { remarkAlert } from 'remark-github-blockquote-alert'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import { remarkCodeTitles } from './remark-code-titles'
import { remarkImgToJsx } from './remark-img-to-jsx'

export const remarkPlugins = [
	remarkGfm,
	remarkCodeTitles,
	remarkMath,
	remarkImgToJsx,
	remarkAlert,
	remarkMediaCard,
]
export const rehypePlugins = [
	rehypeSlug,
	[
		rehypeAutolinkHeadings,
		{
			behavior: 'prepend',
			headingProperties: { className: ['content-header'] },
			content: {
				type: 'element',
				tagName: 'span',
				properties: { className: ['content-header-link-icon'] },
				children: [{ type: 'text', value: '#' }],
			},
		},
	],
	rehypeKatex,
	[rehypeCitation, { path: path.join(process.cwd(), 'data') }],
	[rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
] as import('unified').PluggableList
