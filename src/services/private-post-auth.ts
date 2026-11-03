import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import signing from '@/generated/private-post-key.json'

export const unlockLifetime = 7 * 24 * 60 * 60

export function unlockCookieName(slug: string) {
	return `post_unlock_${createHash('sha256').update(slug).digest('hex').slice(0, 20)}`
}

function signature(slug: string, password: string, expires: string) {
	return createHmac('sha256', signing.key)
		.update(JSON.stringify([slug, password, expires]))
		.digest()
}

export function createUnlockToken(slug: string, password: string) {
	const expires = String(Math.floor(Date.now() / 1000) + unlockLifetime)
	return `${expires}.${signature(slug, password, expires).toString('hex')}`
}

export function isPostUnlocked(
	slug: string,
	password: string | null | undefined,
	token: string | undefined,
) {
	if (!password || !token || !/^\d{10}\.[a-f0-9]{64}$/.test(token)) return false
	const [expires, mac] = token.split('.')
	const remaining = Number(expires) - Math.floor(Date.now() / 1000)
	if (remaining <= 0 || remaining > unlockLifetime) return false
	return timingSafeEqual(
		signature(slug, password, expires),
		Buffer.from(mac, 'hex'),
	)
}

export function passwordMatches(actual: string, expected: string) {
	const hash = (value: string) => createHash('sha256').update(value).digest()
	return timingSafeEqual(hash(actual), hash(expected))
}
