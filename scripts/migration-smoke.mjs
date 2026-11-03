import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash, createHmac } from 'node:crypto'
import { existsSync, openSync, closeSync, copyFileSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { startWorker } from './worker-test-server.mjs'

process.env.NODE_ENV = 'production'

const fixture = 'data/blog/__astro_smoke_test__'
assert(!existsSync(fixture), `Refusing to overwrite ${fixture}`)
const secret = 'astro-protected-body-marker-2981'
const password = 'astro-test-password-2981'
const base = (process.env.BASE_PATH || '').replace(/\/$/, '')
const output = `dist/client${base}`
let worker
const html = async (url) =>
	readFile(path.join(output, url, 'index.html'), 'utf8')
async function files(dir) {
	const entries = await readdir(dir, { withFileTypes: true })
	return (
		await Promise.all(
			entries.map((entry) =>
				entry.isDirectory()
					? files(path.join(dir, entry.name))
					: [path.join(dir, entry.name)],
			),
		)
	).flat()
}

try {
	await mkdir(`${fixture}/nested`, { recursive: true })
	await writeFile(
		`${fixture}/nested/中文.mdx`,
		`---\ntitle: Astro smoke test 中文\ndate: '2026-11-02'\ntags: [AstroSmoke]\nsummary: Smoke test\n---\n## Repeated\n\nPublic body marker $E=mc^2$.\n\n## Repeated\n\n\`\`\`ts:example.ts\nconst answer = 42\n\`\`\`\n\n![Logo](/static/images/logo.png)\n\n<GCPlay />\n`,
	)
	await writeFile(
		`${fixture}/plain.md`,
		"---\ntitle: 2024-04-15\ndate: '2026-10-20'\n---\n![Logo](/static/images/logo.png)\n",
	)
	await writeFile(
		`${fixture}/private.mdx`,
		`---\ntitle: Protected smoke test\ndate: '2026-11-02'\nprivate: true\npassword: '${password}'\ntags: [ProtectedSmokeTag]\n---\n## Private heading\n\n${secret} $E=mc^2$.\n\n![Relative image](./fixture.png)\n\n\`\`\`ts\nconst privateAnswer = 42\n\`\`\`\n\n<GCPlay />\n`,
	)
	copyFileSync('public/static/images/logo.png', `${fixture}/fixture.png`)
	await writeFile(
		`${fixture}/other-private.mdx`,
		`---\ntitle: Another protected post\ndate: '2026-11-02'\nprivate: true\npassword: '${password}'\n---\nother-private-body-marker-2981\n`,
	)
	await writeFile(
		`${fixture}/draft.mdx`,
		"---\ntitle: Draft smoke test\ndate: '2026-11-02'\ndraft: true\ntags: [DraftSmokeTag]\n---\nastro-draft-body-marker-2981\n",
	)
	for (let i = 1; i <= 6; i++)
		await writeFile(
			`${fixture}/page-${i}.mdx`,
			`---\ntitle: Pagination smoke ${i}\ndate: '2026-10-20'\ntags: [AstroSmoke]\n---\nPage ${i}\n`,
		)
	const log = '/tmp/naiveblog-migration-smoke-build.log'
	const logFile = openSync(log, 'w')
	try {
		execFileSync('pnpm', ['exec', 'astro', 'build'], {
			env: { ...process.env, NODE_ENV: 'production' },
			stdio: ['ignore', logFile, 'pipe'],
		})
	} catch (error) {
		console.error(await readFile(log, 'utf8'))
		throw error
	} finally {
		closeSync(logFile)
	}
	const article = await html('blog/__astro_smoke_test__/nested/中文')
	const markdown = await html('blog/__astro_smoke_test__/plain')
	assert(markdown.includes('<title>2024-04-15'))
	assert(markdown.includes('>2024-04-15</h1>'))
	assert(markdown.includes('width="640"'))
	assert(markdown.includes(`${base}/static/images/logo.png`))
	assert(article.includes('Public body marker'))
	assert(article.includes('class="katex"'))
	assert(article.includes('data-copy-code'))
	assert(article.includes('id="repeated-1"'))
	assert(article.includes('gc.'))
	assert(article.includes(`${base}/static/images/logo.png`))
	assert(
		article.includes(
			`${base}/og/__astro_smoke_test__/nested/%E4%B8%AD%E6%96%87.png`,
		),
	)
	assert(existsSync(`${output}/og/__astro_smoke_test__/nested/中文.png`))
	const png = await readFile(
		`${output}/og/__astro_smoke_test__/nested/中文.png`,
	)
	assert.equal(png.readUInt32BE(16), 1200)
	assert.equal(png.readUInt32BE(20), 630)
	await writeFile('/tmp/naiveblog-og-smoke.png', png)
	assert((await html('blog/page/2')).includes('上一页'))
	assert((await html('tags/astrosmoke')).includes('Astro smoke test'))
	assert(
		(await html('categories/blog/__astro_smoke_test__/nested')).includes(
			'Astro smoke test',
		),
	)
	assert(!existsSync(`${output}/blog/__astro_smoke_test__/private/index.html`))
	assert(!existsSync(`${output}/blog/__astro_smoke_test__/draft/index.html`))
	for (const file of await files(output)) {
		if (!/\.(?:html|js|json|xml|txt|map)$/.test(file)) continue
		const text = await readFile(file, 'utf8')
		for (const marker of [
			secret,
			'other-private-body-marker-2981',
			JSON.parse(await readFile('src/generated/private-post-key.json', 'utf8'))
				.key,
			password,
			'astro-draft-body-marker-2981',
			createHash('sha256').update(password).digest('hex'),
		])
			assert(!text.includes(marker), `Protected content leaked into ${file}`)
	}
	for (const name of ['search.json', 'feed.xml', 'sitemap.xml']) {
		const text = await readFile(`${output}/${name}`, 'utf8')
		assert(!text.includes('__astro_smoke_test__/private'), name)
		assert(!text.includes('__astro_smoke_test__/draft'), name)
	}
	const blog = await html('blog')
	assert(!blog.includes('Protected smoke test'))
	assert(!blog.includes('Draft smoke test'))
	worker = await startWorker({ base })
	const request = (url, init) =>
		fetch(`${worker.origin}${base}${url}`, {
			...init,
			redirect: 'manual',
			signal: AbortSignal.timeout(60000),
		})
	const staticResponse = await request('/blog')
	assert.equal(staticResponse.status, 200)
	assert.equal(staticResponse.headers.get('x-content-type-options'), 'nosniff')
	assert(
		staticResponse.headers
			.get('content-security-policy')
			?.includes("default-src 'self'"),
	)
	const privateURL = '/blog/__astro_smoke_test__/private'
	const locked = await request(privateURL)
	assert.equal(locked.status, 200)
	assert.equal(locked.headers.get('cache-control'), 'private, no-store')
	assert.equal(locked.headers.get('vary'), 'Cookie')
	const gate = await locked.text()
	assert(gate.includes('article-password'))
	assert(gate.includes('noindex, nofollow'))
	assert(!gate.includes(secret))
	assert(!gate.includes('Private heading'))
	const unlock = (body) =>
		request('/api/blog/password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		})
	assert.equal(
		(await unlock({ slug: '__astro_smoke_test__/private', password: 'wrong' }))
			.status,
		401,
	)
	assert.equal((await unlock({ slug: '__proto__', password })).status, 401)
	assert.equal(
		(await unlock({ slug: '__astro_smoke_test__/nested/中文', password }))
			.status,
		401,
	)
	assert.equal(
		(await unlock({ slug: '__astro_smoke_test__/draft', password })).status,
		401,
	)
	assert.equal((await unlock({})).status, 400)
	assert.equal((await unlock(null)).status, 400)
	const result = await unlock({
		slug: '__astro_smoke_test__/private',
		password,
	})
	assert.equal(result.status, 200)
	assert.equal(result.headers.get('cache-control'), 'private, no-store')
	const data = await result.json()
	assert.deepEqual(data, { ok: true })
	const setCookie = result.headers.get('set-cookie')
	assert(setCookie.includes('HttpOnly'))
	assert(setCookie.includes('SameSite=Lax'))
	assert(setCookie.includes(`Path=${base}/blog/`))
	assert(setCookie.includes('Max-Age=604800'))
	const cookie = setCookie.split(';')[0]
	const signingKey = JSON.parse(
		await readFile('src/generated/private-post-key.json', 'utf8'),
	).key
	const makeToken = (slug, articlePassword, expires) =>
		`${expires}.${createHmac('sha256', signingKey)
			.update(JSON.stringify([slug, articlePassword, String(expires)]))
			.digest('hex')}`

	const authenticated = await request(privateURL, {
		headers: { Cookie: cookie },
	})
	assert.equal(authenticated.status, 200)
	assert.equal(authenticated.headers.get('cache-control'), 'private, no-store')
	const unlocked = await authenticated.text()
	assert(unlocked.includes(secret))
	assert(unlocked.includes('id="private-heading"'))
	assert(unlocked.includes('class="katex"'))
	assert(unlocked.includes('data-copy-code'))
	assert(unlocked.includes('gc.'))
	assert(unlocked.includes('alt="Relative image"'))
	assert(!unlocked.includes('article-password'))
	assert(!unlocked.includes(password))
	const imageURL = unlocked.match(
		/<img[^>]*src="([^"]+)"[^>]*alt="Relative image"/,
	)?.[1]
	assert(imageURL, 'Native relative image was not rendered')
	const imageResponse = await fetch(new URL(imageURL, worker.origin))
	assert.equal(imageResponse.status, 200)
	// A signature belongs to one article, even when two articles share a password.
	const otherUnlock = await unlock({
		slug: '__astro_smoke_test__/other-private',
		password,
	})
	const otherCookieName = otherUnlock.headers.get('set-cookie').split('=')[0]
	const other = await request('/blog/__astro_smoke_test__/other-private', {
		headers: { Cookie: `${otherCookieName}=${cookie.split('=')[1]}` },
	})
	assert(!(await other.text()).includes('other-private-body-marker-2981'))
	const tampered = cookie.slice(0, -1) + (cookie.endsWith('0') ? '1' : '0')
	assert(
		!(
			await (
				await request(privateURL, { headers: { Cookie: tampered } })
			).text()
		).includes(secret),
	)
	const cookieName = cookie.split('=')[0]
	const expired = `${cookieName}=${makeToken('__astro_smoke_test__/private', password, 1000000000)}`
	assert(
		!(
			await (await request(privateURL, { headers: { Cookie: expired } })).text()
		).includes(secret),
	)
	const oldPassword = `${cookieName}=${makeToken('__astro_smoke_test__/private', 'previous-password', Math.floor(Date.now() / 1000) + 3600)}`
	assert(
		!(
			await (
				await request(privateURL, { headers: { Cookie: oldPassword } })
			).text()
		).includes(secret),
	)
	assert(!(await (await request(privateURL)).text()).includes(secret))
	const foreignOrigin = await request('/api/blog/password', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Origin: 'https://example.invalid',
		},
		body: JSON.stringify({ slug: '__astro_smoke_test__/private', password }),
	})
	assert.equal(foreignOrigin.status, 403)
	assert.equal((await request('/api/blog/password')).status, 404)
	for (const [old, target] of [
		['/archive.html', '/blog'],
		['/about.html', '/about'],
		['/github.html', '/projects'],
		['/author/1', '/about'],
		['/cross.html/2', '/memory'],
		['/page/2', '/blog/page/2'],
	]) {
		const response = await request(old)
		assert.equal(response.status, 308, old)
		assert.equal(response.headers.get('location'), `${base}${target}`, old)
	}
	const mapping = JSON.parse(
		await readFile('data/old-blog-posts-mapping.json', 'utf8'),
	)
	const [oldPath, id] = Object.entries(mapping)[0]
	const redirect = await request(`/archives/${id}`)
	assert.equal(redirect.status, 308)
	assert.equal(
		decodeURI(redirect.headers.get('location')),
		`${base}/blog/${oldPath}`,
	)
	for (const url of [
		'/blog/__astro_smoke_test__/draft',
		'/blog/missing-post-2981',
		'/blog/page/999999',
		'/tags/missing-tag-2981',
	])
		assert.equal((await request(url)).status, 404, url)
	const missing = await request('/not-an-existing-page-2981')
	assert.equal(missing.status, 404)
	assert((await missing.text()).includes('你来到了神隐之地'))
	assert.equal(missing.headers.get('x-content-type-options'), 'nosniff')
	const og = await request(
		'/og/__astro_smoke_test__/nested/%E4%B8%AD%E6%96%87.png',
	)
	assert.equal(og.status, 200)
	assert.equal(og.headers.get('content-type'), 'image/png')
	assert((await og.arrayBuffer()).byteLength > 1000)
	assert.equal((await request('/api/3party/netease/playlist')).status, 400)
	assert.equal((await request('/api/og/image/post?title=old')).status, 404)
	console.log(
		'Migration smoke passed: static routes, MDX, pagination, protected content, APIs, legacy redirects, OG and 404.',
	)
} finally {
	await worker?.stop()
	await rm(fixture, { recursive: true, force: true })
	// Test builds must never be mistaken for deployable site output.
	await rm('dist', { recursive: true, force: true })
}
