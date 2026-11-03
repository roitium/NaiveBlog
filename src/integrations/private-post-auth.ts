import { mkdir, writeFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import type { AstroIntegration } from 'astro'

/** Generate server-only signing material; never bundle protected bodies for clients. */
export default function privatePostAuth(secret?: string): AstroIntegration {
	let development = false
	if (secret && Buffer.byteLength(secret) < 32)
		throw new Error(
			'PRIVATE_POST_COOKIE_SECRET must contain at least 32 bytes.',
		)
	return {
		name: 'private-post-auth',
		hooks: {
			'astro:config:setup': async ({ command }) => {
				development = command === 'dev'
				await mkdir('src/generated', { recursive: true })
				await writeFile(
					'src/generated/private-post-key.json',
					JSON.stringify({ key: secret || randomBytes(32).toString('hex') }),
				)
			},
			'astro:route:setup': ({ route }) => {
				// Dev prerender simulation omits request cookies; use SSR locally too.
				if (development && route.component === 'src/pages/blog/[...slug].astro')
					route.prerender = false
			},
		},
	}
}
