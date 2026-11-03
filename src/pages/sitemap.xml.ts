import type { APIRoute } from 'astro'
import site from '@/data/siteMetadata'
import { allPosts } from '@/services/content/core'
import {
	createCategoryTree,
	createTagCount,
	type CategoryTreeNode,
} from '@/services/content/metaGen'
import { filterPublicPosts } from '@/services/content/utils'
import { withBase } from '@/utils/paths'
const escape = (text: string) =>
	text.replace(
		/[<>&"']/g,
		(char) =>
			({
				'<': '&lt;',
				'>': '&gt;',
				'&': '&amp;',
				'"': '&quot;',
				"'": '&apos;',
			})[char]!,
	)
export const GET: APIRoute = () => {
	function categories(node: CategoryTreeNode): string[] {
		return [
			`/categories/${node.fullPath}`,
			...Object.values(node.children).flatMap(categories),
		]
	}
	const paths = [
		'',
		'/blog',
		'/about',
		'/projects',
		'/memory',
		'/tags',
		'/categories',
		...filterPublicPosts(allPosts).map((post) => `/${post.path}`),
		...Object.keys(createTagCount(allPosts)).map((tag) => `/tags/${tag}`),
		...categories(createCategoryTree(allPosts)),
	]
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${escape(new URL(withBase(path || '/'), site.siteUrl).href)}</loc></url>`).join('')}</urlset>`,
		{ headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
	)
}
