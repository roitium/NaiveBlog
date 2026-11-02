import type { APIRoute } from 'astro'
import type { PlayList } from '@/types/neteasePlayList'
import { isTimeDifferenceGreaterThan } from '@/utils/time'

const playListCache: { [id: string]: PlayList } = {}

// 默认缓存过期时间 3h
const defaultTTL = 3 * 60 * 60 * 1000

// Worker 内存缓存仅对当前实例有效，不能作为跨实例持久缓存。
export const prerender = false
export const GET: APIRoute = async ({ url }) => {
	const query = url.searchParams
	if (!query.get('id')) {
		return Response.json(
			{ message: 'Invalid request', data: null },
			{ status: 400 },
		)
	}
	const id = query.get('id') as string
	const cacheData: PlayList | undefined = playListCache[id]
	if (
		cacheData &&
		!isTimeDifferenceGreaterThan(cacheData.refreshTimestamp, defaultTTL)
	) {
		return Response.json(
			{ data: cacheData, message: 'success(from cache)' },
			{ status: 200 },
		)
	}
	const response = await fetch(
		`https://music.163.com/api/playlist/detail?id=${encodeURIComponent(id)}`,
		{ credentials: 'omit' },
	)
	const jsonData: PlayList = await response.json()
	if (jsonData.code !== 200) {
		return Response.json(
			{ message: jsonData.message, data: jsonData },
			{ status: 400 },
		)
	}
	jsonData.refreshTimestamp = Date.now()
	playListCache[id] = jsonData
	return Response.json({ message: 'success', data: jsonData }, { status: 200 })
}
