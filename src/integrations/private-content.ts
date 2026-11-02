import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import matter from 'gray-matter'
import { bundleMDX } from 'mdx-bundler'
import type { AstroIntegration } from 'astro'
import { extractTocHeadings } from '../mdx-plugins/toc'
import { remarkPlugins, rehypePlugins } from '../mdx-plugins/config'

async function compilePrivatePosts() {
	const posts: Record<
		string,
		{ passwordHash: string; code: string; toc: unknown[] }
	> = {}
	const root = path.resolve('data/blog')
	let files: string[] = []
	try {
		files = await readdir(root, { recursive: true })
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
	}
	for (const file of files.filter((name) => /\.mdx?$/.test(name))) {
		const source = await readFile(path.join(root, file), 'utf8')
		const { data, content } = matter(source)
		if (
			!data.private ||
			!data.password ||
			(data.draft && process.env.NODE_ENV === 'production')
		)
			continue
		const { code } = await bundleMDX({
			source: content,
			cwd: path.dirname(path.join(root, file)),
			mdxOptions: (options) => ({ ...options, remarkPlugins, rehypePlugins }),
		})
		posts[file.replace(/\.mdx?$/, '')] = {
			passwordHash: createHash('sha256')
				.update(String(data.password))
				.digest('hex'),
			code,
			toc: await extractTocHeadings(content),
		}
	}
	await mkdir('src/generated', { recursive: true })
	await writeFile('src/generated/private-posts.json', JSON.stringify(posts))
}

export default function privateContent(): AstroIntegration {
	return {
		name: 'private-content',
		hooks: {
			'astro:config:setup': async () => {
				await compilePrivatePosts()
			},
			'astro:server:setup': ({ server }) => {
				// Recompile protected documents before Vite reloads their endpoint module.
				server.watcher.on('all', async (_event, file) => {
					if (file.includes('/data/blog/') && /\.mdx?$/.test(file)) {
						try {
							await compilePrivatePosts()
						} catch (error) {
							server.config.logger.error(String(error))
						}
					}
				})
			},
		},
	}
}
