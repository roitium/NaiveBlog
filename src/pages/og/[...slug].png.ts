import type { APIRoute, GetStaticPaths } from 'astro'
import { allPosts } from '@/services/content/core'
import { generateOG } from '@/services/og'

export const prerender = true
export const getStaticPaths: GetStaticPaths = () =>
	allPosts
		.filter((post) => !import.meta.env.PROD || !post.draft)
		.map((post) => ({
			params: { slug: post.slug },
			props: { title: post.title, description: post.summary, date: post.date },
		}))

// Render during the Node build; the Worker serves the resulting PNG as an asset.
export const GET: APIRoute = ({ props }) =>
	generateOG(props as Parameters<typeof generateOG>[0])
