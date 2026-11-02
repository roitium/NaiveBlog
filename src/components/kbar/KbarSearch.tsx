'use client'
import type { Action } from 'kbar'
import { KBarProvider } from 'kbar'
import { navigate } from 'astro:transitions/client'
import { withBase } from '@/utils/paths'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { KBarModal } from '@/components/kbar/KBarModal'
import type { Post } from '@/services/content/core'
import { formatDate } from '@/utils/time'

export const KBarSearchProvider = ({ children }) => {
	const searchDocumentsPath = withBase('/search.json')
	const [searchActions, setSearchActions] = useState<Action[]>([])
	const [dataLoaded, setDataLoaded] = useState(false)

	const defaultActions = useMemo(() => [], [])

	const mapPosts = useCallback((posts: Post[]) => {
		const actions: Action[] = []
		for (const post of posts) {
			actions.push({
				id: post.path,
				name: post.title,
				keywords: post.content,
				section: 'Blog',
				subtitle: formatDate(post.date),
				perform: () => navigate(withBase(`/${post.path}`)),
			})
		}
		return actions
	}, [])

	useEffect(() => {
		async function fetchData() {
			if (searchDocumentsPath) {
				const res = await fetch(searchDocumentsPath)
				const json = await res.json()
				const actions = mapPosts(json)
				setSearchActions(actions)
				setDataLoaded(true)
			}
		}
		if (!dataLoaded && searchDocumentsPath) {
			fetchData().catch((error) => {
				console.error(error)
				toast.error('获取搜索数据失败')
			})
		}
	}, [mapPosts, dataLoaded, searchDocumentsPath])

	const memoizedProvider = useMemo(
		() => (
			<KBarProvider actions={defaultActions}>
				<KBarModal
					actions={searchActions}
					isLoading={!dataLoaded}
				/>
				{children}
			</KBarProvider>
		),
		[defaultActions, searchActions, dataLoaded, children],
	)

	return memoizedProvider
}
