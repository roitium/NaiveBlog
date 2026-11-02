import { defineMiddleware } from 'astro:middleware'
import mapping from '@/data/old-blog-posts-mapping.json'
import { withBase, withoutBase } from '@/utils/paths'

const csp =
	"default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app analytics.umami.is openpanel.dev unpkg.com; style-src 'self' 'unsafe-inline'; img-src * blob: data:; media-src *.s3.amazonaws.com; connect-src *; font-src 'self'; frame-src giscus.app;"
export const onRequest = defineMiddleware(async (context, next) => {
	const path = withoutBase(context.url.pathname).replace(/\/$/, '') || '/'
	const direct: Record<string, string> = {
		'/archive.html': '/blog',
		'/about.html': '/about',
		'/github.html': '/projects',
		'/author/1': '/about',
		'/cross.html': '/memory',
	}
	let target = direct[path]
	if (path.startsWith('/cross.html/')) target = '/memory'
	const page = path.match(/^\/page\/(\d+)$/)
	if (page) target = `/blog/page/${page[1]}`
	const archive = path.match(/^\/archives\/(\d+)$/)
	if (archive) {
		const entry = Object.entries(mapping).find(
			([, id]) => id === Number(archive[1]),
		)
		if (entry) target = `/blog/${entry[0]}`
	}
	if (target) return context.redirect(withBase(target), 308)
	const response = await next()
	response.headers.set('Content-Security-Policy', csp)
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
	response.headers.set('X-Frame-Options', 'DENY')
	response.headers.set('X-Content-Type-Options', 'nosniff')
	response.headers.set(
		'Strict-Transport-Security',
		'max-age=31536000; includeSubDomains',
	)
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=()',
	)
	return response
})
