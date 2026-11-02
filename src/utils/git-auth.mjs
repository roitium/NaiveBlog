/** Pass GitHub credentials through Git's environment, never command arguments. */
export function buildGitEnvironment(gitUrl, sourceEnv = process.env) {
	const env = { ...sourceEnv, GIT_TERMINAL_PROMPT: '0' }
	const token = env.GIT_TOKEN
	if (!token) return env
	let url
	try {
		url = new URL(gitUrl)
	} catch {
		throw new Error(
			'使用 GIT_TOKEN 时，GIT_URL 必须是 https://github.com/ 下的仓库地址。',
		)
	}
	if (
		url.protocol !== 'https:' ||
		url.hostname !== 'github.com' ||
		url.username ||
		url.password ||
		url.port
	)
		throw new Error(
			'使用 GIT_TOKEN 时，请使用不含凭据的 https://github.com/ 仓库地址。',
		)
	const count = Number(env.GIT_CONFIG_COUNT || 0)
	if (!Number.isSafeInteger(count) || count < 0)
		throw new Error('无效的 Git 构建环境配置。')
	// Reset inherited Authorization headers before adding the read-only credential.
	const key = 'http.https://github.com/.extraheader'
	env[`GIT_CONFIG_KEY_${count}`] = key
	env[`GIT_CONFIG_VALUE_${count}`] = ''
	env[`GIT_CONFIG_KEY_${count + 1}`] = key
	env[`GIT_CONFIG_VALUE_${count + 1}`] =
		`Authorization: Basic ${Buffer.from(`x-access-token:${token}`).toString('base64')}`
	env.GIT_CONFIG_COUNT = String(count + 2)
	// Prevent inherited Git tracing from exposing HTTP headers in build logs.
	env.GIT_TRACE = '0'
	env.GIT_TRACE_CURL = '0'
	env.GIT_CURL_VERBOSE = '0'
	delete env.GIT_TOKEN
	return env
}
