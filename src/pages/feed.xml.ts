import type { APIRoute } from 'astro'
import { allPosts } from '@/services/content/core'
import { generateRssFeed } from '@/services/content/metaGen'
export const GET: APIRoute = async () =>
	new Response(await generateRssFeed(allPosts), {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
	})
