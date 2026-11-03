import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Convert #tag/subtag syntax to span element with tag style
 */
export const remarkTagToJsx: Plugin = () => (tree) => {
	visit(tree, 'text', (node: { value: string }, index, parent) => {
		if (!parent || index === null || typeof node.value !== 'string') return

		const value = node.value
		const tagRegex = /#([a-zA-Z0-9]+(?:\/[a-zA-Z0-9]+)*)/g
		// biome-ignore lint/suspicious/noImplicitAnyLet: 这个插件代码我还没完全看懂，先用
		let match
		let lastIndex = 0
		// oxlint-disable-next-line typescript/no-explicit-any -- 我太懒了！有空替换成 unknown！
		const parts: any[] = []

		// biome-ignore lint/suspicious/noAssignInExpressions: 这个插件代码我还没完全看懂，先用
		while ((match = tagRegex.exec(value)) !== null) {
			// Add text before tag
			if (match.index > lastIndex) {
				parts.push({
					type: 'text',
					value: value.slice(lastIndex, match.index),
				})
				console.log(value.slice(lastIndex, match.index))
			}

			parts.push({
				type: 'inlineCode',
				value: match[0].replace('#', 'tag: '),
			})

			lastIndex = match.index + match[0].length
		}

		// Add remaining text
		if (lastIndex < value.length) {
			parts.push({
				type: 'text',
				value: value.slice(lastIndex),
			})
		}

		if (parts.length > 0) {
			// @ts-expect-error 111
			parent.children.splice(index, 1, ...parts)
		}
	})
}
