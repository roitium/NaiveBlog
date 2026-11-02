const base = import.meta.env.BASE_URL.replace(/\/$/, '')
export function withBase(path: string) {
	if (
		!path.startsWith('/') ||
		path.startsWith('//') ||
		!base ||
		path === base ||
		path.startsWith(`${base}/`)
	)
		return path
	return `${base}${path}`
}
export function withoutBase(path: string) {
	return base && (path === base || path.startsWith(`${base}/`))
		? path.slice(base.length) || '/'
		: path
}
