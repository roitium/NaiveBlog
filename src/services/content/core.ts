import { getCollection } from 'astro:content'
import readingTime from 'reading-time'
import { extractTocHeadings } from '@/mdx-plugins/toc'

// Keep framework data on the server. Client islands import these types only.
export const allPosts = await Promise.all(
	(await getCollection('posts')).map(async (entry) => ({
		...entry.data,
		slug: entry.id,
		path: `blog/${entry.id}`,
		content: entry.body || '',
		_id: entry.id,
		_meta: {
			filePath: `blog/${entry.id}.mdx`,
			directory: `blog/${entry.id}`.split('/').slice(0, -1).join('/'),
		},
		readingTime: readingTime(entry.body || '').minutes,
		toc: await extractTocHeadings(entry.body || ''),
	})),
)
export type Post = (typeof allPosts)[number]
export const allAuthors = (await getCollection('authors')).map((entry) => ({
	...entry.data,
	slug: entry.id,
}))
export type Author = (typeof allAuthors)[number]
