import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { once } from 'node:events'
import { setTimeout } from 'node:timers/promises'

/** Start the built Worker in workerd, with static assets and _headers enabled. */
export async function startWorker({ base = '' } = {}) {
	const portProbe = createServer()
	portProbe.listen(0, '127.0.0.1')
	await once(portProbe, 'listening')
	const port = portProbe.address().port
	await new Promise((resolve, reject) =>
		portProbe.close((error) => (error ? reject(error) : resolve())),
	)
	const child = spawn(
		'pnpm',
		[
			'exec',
			'wrangler',
			'dev',
			'--local',
			'--ip',
			'127.0.0.1',
			'--port',
			String(port),
			'--inspector-port',
			'0',
			'--log-level',
			'error',
		],
		{ detached: true, stdio: ['ignore', 'pipe', 'pipe'] },
	)
	let logs = ''
	child.stdout.on('data', (data) => {
		logs += data
	})
	child.stderr.on('data', (data) => {
		logs += data
	})
	const stop = async () => {
		if (child.exitCode !== null) return
		const exited = once(child, 'exit')
		try {
			globalThis.process.kill(-child.pid, 'SIGTERM')
		} catch (error) {
			if (error.code !== 'ESRCH') throw error
		}
		await exited
	}
	const origin = `http://127.0.0.1:${port}`
	try {
		for (let attempt = 0; attempt < 150; attempt++) {
			if (child.exitCode !== null)
				throw new Error(`Wrangler exited with ${child.exitCode}:\n${logs}`)
			try {
				const response = await fetch(`${origin}${base}/`, {
					signal: AbortSignal.timeout(1000),
				})
				if (response.ok) return { origin, stop }
			} catch {
				/* Wait until workerd is listening. */
			}
			await setTimeout(200)
		}
		throw new Error(`Timed out starting workerd:\n${logs}`)
	} catch (error) {
		await stop()
		throw error
	}
}
