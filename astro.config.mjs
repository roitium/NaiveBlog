import { execFileSync } from 'node:child_process'
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import cloudflare from '@astrojs/cloudflare'
import { loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { unified } from '@astrojs/markdown-remark'
import privatePostAuth from './src/integrations/private-post-auth.ts'
import { remarkImgToJsx } from './src/mdx-plugins/remark-img-to-jsx.ts'
import { remarkPlugins, rehypePlugins } from './src/mdx-plugins/config.ts'

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '')
// Accept existing deployment variables while new installations use PUBLIC_*.
const publicEnv = Object.fromEntries(
	Object.entries({ ...env, ...process.env })
		.filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
		.map(([key, value]) => [key.replace('NEXT_PUBLIC_', 'PUBLIC_'), value]),
)
Object.assign(
	publicEnv,
	Object.fromEntries(
		Object.entries({ ...env, ...process.env }).filter(([key]) =>
			key.startsWith('PUBLIC_'),
		),
	),
)
try {
	publicEnv.PUBLIC_COMMIT_HASH ||= execFileSync('git', ['rev-parse', 'HEAD'], {
		encoding: 'utf8',
	}).trim()
} catch {
	/* A source archive may not contain .git. */
}
publicEnv.PUBLIC_BUILD_TIME = new Date().toISOString()

const base = env.BASE_PATH || process.env.BASE_PATH || '/'
const markdownPlugins = remarkPlugins.map((plugin) =>
	plugin === remarkImgToJsx ? [remarkImgToJsx, { base }] : plugin,
)

export default defineConfig({
	site: 'https://www.roitium.com',
	base,
	redirects: {
		'/about.html': {
			status: 308,
			destination: `${base.replace(/\/$/, '')}/about`,
		},
	},
	adapter: cloudflare({
		imageService: 'compile',
		prerenderEnvironment: 'node',
	}),
	session: false,
	integrations: [
		privatePostAuth(
			env.PRIVATE_POST_COOKIE_SECRET || process.env.PRIVATE_POST_COOKIE_SECRET,
		),
		react(),
		mdx(),
	],
	markdown: {
		syntaxHighlight: false,
		processor: unified({
			remarkPlugins: markdownPlugins,
			rehypePlugins,
			smartypants: false,
		}),
	},
	vite: {
		plugins: [tailwindcss()],
		define: Object.fromEntries(
			Object.entries(publicEnv).map(([key, value]) => [
				`import.meta.env.${key}`,
				JSON.stringify(value),
			]),
		),
	},
})
