import type { APIRoute } from 'astro'
import site from '@/data/siteMetadata'
import { withBase } from '@/utils/paths'
export const GET: APIRoute = () =>
	new Response(
		`User-agent: *\nAllow: /\nSitemap: ${new URL(withBase('/sitemap.xml'), site.siteUrl).href}\n`,
		{ headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
	)
