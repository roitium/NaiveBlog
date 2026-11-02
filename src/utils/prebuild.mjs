import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { loadEnv } from 'vite'
import { buildGitEnvironment } from './git-auth.mjs'
Object.assign(process.env, {
	...loadEnv(
		process.argv[2] || process.env.NODE_ENV || 'production',
		process.cwd(),
		'',
	),
	...process.env,
})
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	renameSync,
	rmSync,
} from 'node:fs'

console.log(`
 /$$   /$$           /$$                           /$$$$$$$  /$$                    
| $$$ | $$          |__/                          | $$__  $$| $$                    
| $$$$| $$  /$$$$$$  /$$ /$$    /$$ /$$$$$$       | $$  \\ $$| $$  /$$$$$$   /$$$$$$ 
| $$ $$ $$ |____  $$| $$|  $$  /$$//$$__  $$      | $$$$$$$ | $$ /$$__  $$ /$$__  $$
| $$  $$$$  /$$$$$$$| $$ \\  $$/$$/| $$$$$$$$      | $$__  $$| $$| $$  \\ $$| $$  \\ $$
| $$\\  $$$ /$$__  $$| $$  \\  $$$/ | $$_____/      | $$  \\ $$| $$| $$  | $$| $$  | $$
| $$ \\  $$|  $$$$$$$| $$   \\  $/  |  $$$$$$$      | $$$$$$$/| $$|  $$$$$$/|  $$$$$$$
|__/  \\__/ \\_______/|__/    \\_/    \\_______/      |_______/ |__/ \\______/  \\____  $$
                                                                           /$$  \\ $$
                                                                          |  $$$$$$/
                                                                           \\______/ 
`)
console.log('Welcome to Naive Blog!')

const syncContentFromGit = async (contentDir) => {
	try {
		if (!process.env.GIT_URL) {
			console.log(
				'No GIT_URL found in environment variables, skipping content sync',
			)
			return
		}
		const gitUrl = process.env.GIT_URL
		const gitEnv = buildGitEnvironment(gitUrl)
		try {
			await promisify(execFile)(
				'git',
				[
					'clone',
					'--depth',
					'1',
					'--single-branch',
					'--',
					gitUrl,
					`${contentDir}/blog-tmp`,
				],
				{ env: gitEnv },
			)
		} catch {
			throw new Error(
				'文章仓库拉取失败。请检查 GIT_URL、GIT_TOKEN、GitHub 仓库权限和网络连接。',
			)
		}

		console.log('✅ Synced content files from git successfully!')
		mkdirSync(`${contentDir}/blog`, { recursive: true })
		cpSync(`${contentDir}/blog-tmp/blog-posts/`, `${contentDir}/blog`, {
			recursive: true,
		})
		cpSync(
			`${contentDir}/blog-tmp/static/images/`,
			`${process.cwd()}/public/static/images`,
			{
				recursive: true,
			},
		)
		// 将 md 文件重命名为 mdx 文件
		const files = readdirSync(`${contentDir}/blog`, { recursive: true })
		for (const file of files) {
			if (file.endsWith('.md')) {
				renameSync(
					`${contentDir}/blog/${file}`,
					`${contentDir}/blog/${file.replace('.md', '.mdx')}`,
				)
			}
		}
		console.log('✅ Fetched content files from git successfully!')
	} finally {
		if (existsSync(`${contentDir}/blog-tmp`)) {
			rmSync(`${contentDir}/blog-tmp`, { recursive: true })
		}
	}
}

syncContentFromGit(`${process.cwd()}/data`).catch((error) => {
	console.error(error.message)
	process.exit(1)
})
