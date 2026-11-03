import remarkMath from 'remark-math'
import { remarkAlert } from 'remark-github-blockquote-alert'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'

export const remarkPlugins = [remarkMath, remarkAlert]
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
] as import('unified').PluggableList
