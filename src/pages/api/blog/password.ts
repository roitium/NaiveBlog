import { createHash, timingSafeEqual } from 'node:crypto'
import type { APIRoute } from 'astro'
import privatePosts from '@/generated/private-posts.json'
export const prerender = false
const headers = {
	'Content-Type': 'application/json',
	'Cache-Control': 'private, no-store',
	'X-Robots-Tag': 'noindex',
}
export const POST: APIRoute = async ({ request }) => {
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
		typeof body.slug !== 'string' ||
		typeof body.password !== 'string' ||
		!body.password ||
		body.password.length > 1024
	)
		return new Response(JSON.stringify({ message: 'Invalid request' }), {
			status: 400,
			headers,
		})
	const post = Object.hasOwn(privatePosts, body.slug)
		? (
				privatePosts as Record<
					string,
					{ passwordHash: string; code: string; toc: unknown[] }
				>
			)[body.slug]
		: undefined
	const actual = createHash('sha256').update(body.password).digest()
	const expected = Buffer.from(post?.passwordHash || '0'.repeat(64), 'hex')
	if (!timingSafeEqual(actual, expected) || !post)
		return new Response(JSON.stringify({ message: '密码错误，请重新输入！' }), {
			status: 401,
			headers,
		})
	return new Response(
		JSON.stringify({ ok: true, code: post.code, toc: post.toc }),
		{ headers },
	)
}
