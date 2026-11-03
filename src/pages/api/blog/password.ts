import type { APIRoute } from 'astro'
import { allPosts } from '@/services/content/core'
import {
	createUnlockToken,
	passwordMatches,
	unlockCookieName,
	unlockLifetime,
} from '@/services/private-post-auth'
import { withBase } from '@/utils/paths'
export const prerender = false
const headers = {
	'Content-Type': 'application/json',
	'Cache-Control': 'private, no-store',
	'X-Robots-Tag': 'noindex',
}
export const POST: APIRoute = async ({ request, cookies, url }) => {
	const origin = request.headers.get('origin')
	if (origin && origin !== url.origin)
		return new Response(JSON.stringify({ message: 'Invalid origin' }), {
			status: 403,
			headers,
		})
	let body: { slug?: unknown; password?: unknown }
	try {
		body = await request.json()
	} catch {
		return new Response(JSON.stringify({ message: 'Invalid request' }), {
			status: 400,
			headers,
		})
	}
	if (
		!body ||
		typeof body !== 'object' ||
		typeof body.slug !== 'string' ||
		typeof body.password !== 'string' ||
		!body.password ||
		body.password.length > 1024
	)
		return new Response(JSON.stringify({ message: 'Invalid request' }), {
			status: 400,
			headers,
		})
	const post = allPosts.find(
		(entry) =>
			entry.slug === body.slug &&
			entry.private &&
			(!import.meta.env.PROD || !entry.draft),
	)
	if (!post?.password || !passwordMatches(body.password, post.password))
		return new Response(JSON.stringify({ message: '密码错误，请重新输入！' }), {
			status: 401,
			headers,
		})
	cookies.set(
		unlockCookieName(post.slug),
		createUnlockToken(post.slug, post.password),
		{
			httpOnly: true,
			secure: url.protocol === 'https:',
			sameSite: 'lax',
			path: withBase('/blog/'),
			maxAge: unlockLifetime,
		},
	)
	return new Response(JSON.stringify({ ok: true }), { headers })
}
