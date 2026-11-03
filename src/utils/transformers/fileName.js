/**
 * Adds a file name label to Shiki code blocks that use the `file="..."`
 * meta attribute.
 */
export const transformerFileName = ({
	style = 'v2',
	hideDot = false,
} = {}) => ({
	pre(node) {
		const fileNameOffset = style === 'v1' ? '0.75rem' : '-0.75rem'
		node.properties.style =
			(node.properties.style || '') + `--file-name-offset: ${fileNameOffset};`

		const raw = this.options.meta?.__raw?.split(' ')
		if (!raw) return

		const metaMap = new Map()
		for (const item of raw) {
			const [key, value] = item.split('=')
			if (!key || !value) continue
			metaMap.set(key, value.replace(/["'`]/g, ''))
		}

		const file = metaMap.get('file')
		if (!file) return

		this.addClassToHast(node, `mt-8 ${style === 'v1' ? 'rounded-tl-none' : ''}`)

		node.children.push({
			type: 'element',
			tagName: 'span',
			properties: {
				class: [
					'absolute py-1 text-slate-12 text-xs font-medium leading-4 dark:text-slatedark-12',
					hideDot
						? 'px-2'
						: 'pl-4 pr-2 before:absolute before:top-[45%] before:left-2 before:inline-block before:size-1 before:rounded-full before:bg-green-500',
					style === 'v1'
						? 'left-0 -top-6 rounded-t-md border border-b-0 border-gray-200 bg-slate-3/50 dark:border-gray-700 dark:bg-slatedark-3/50'
						: 'left-2 top-(--file-name-offset) rounded-md border border-gray-200 bg-slate-2 dark:border-gray-700 dark:bg-slatedark-2',
				],
			},
			children: [{ type: 'text', value: file }],
		})
	},
})
