'use client'
import clsx from 'clsx'
import PageTitle from '@/components/PageTitle'
import type { ApiMemo } from '@/types/memos'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-zoom.css'
import 'lightgallery/css/lightgallery.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { fetchMemos } from './fetchFunctions'
import { MemoRowComponent } from './singleMemoRow'

const DISABLE_LOAD_MORE = true // 是否禁用加载更多功能

/**
 * Memos页面
 * @returns Memos页面
 */
export default function MemosPage() {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	// 是否是初次加载
	const [hasLoaded, setHasLoaded] = useState(false)
	const [memos, setMemos] = useState<ApiMemo[]>([])
	const loadMoreRef = useRef<HTMLDivElement>(null)

	// 初始化Memos列表
	useEffect(() => {
		setIsLoading(true)
		if (!process.env.NEXT_PUBLIC_MEMOS_ENDPOINT) {
			toast.error('你还没设置 memos endpoint！')
			return
		}
		fetchMemos().then((data) => {
			if (data === false) {
				setIsLoading(true)
				setHasLoaded(true)
				setMemos([])
				return
			}
			setMemos(data)
			setIsLoading(false)
			setHasLoaded(true)
		})
		return () => {}
	}, [])

	// 使用 IntersectionObserver 自动加载更多
	useEffect(() => {
		if (DISABLE_LOAD_MORE) return
		const current = loadMoreRef.current
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !isLoading) {
				setTimeout(() => {
					setIsLoading(true)
					fetchMemos().then((data) => {
						if (data === false) {
							setIsLoading(false)
							setHasLoaded(true)
							setMemos([])
							return
						}
						setMemos(memos.concat(data))
						setIsLoading(false)
					})
				}, 500)
			}
		})
		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current)
		}
		return () => {
			if (current) {
				observer.unobserve(current)
			}
		}
	}, [isLoading, memos])

	// 加载更多Memos
	function onClickFetchMore() {
		if (DISABLE_LOAD_MORE) return
		setIsLoading(true)
		fetchMemos().then((data) => {
			if (data === false) {
				setIsLoading(false)
				setHasLoaded(true)
				setMemos([])
				return
			}
			setMemos(memos.concat(data))
			setIsLoading(false)
		})
	}

	const subtitle = useMemo(
		() => (
			<>
				<p>人生三大乐事：梗图、发癫与暴论</p>
			</>
		),
		[],
	)

	const memoizedPageTitle = useMemo(
		() => (
			<PageTitle
				title='Memories'
				subtitle={subtitle}
			/>
		),
		[subtitle],
	)

	return (
		<div className='flex w-full flex-col lg:mx-auto lg:max-w-(--breakpoint-lg)'>
			{memoizedPageTitle}
			<div
				className={clsx('flex w-full flex-col', hasLoaded && ' appear-animate')}
			>
				{memos
					? memos.map((memo) => (
							<MemoRowComponent
								memo={memo}
								key={memo.id}
							/>
						))
					: null}
			</div>
			<div
				ref={loadMoreRef}
				className={'h-[1px]'}
			/>
			<button
				onClick={onClickFetchMore}
				disabled={isLoading}
				className='mt-3 justify-center text-blue-11 dark:text-skydark-11'
			>
				{isLoading ? (
					<div className='mx-auto mt-3 w-6'>
						{/*<LoadSpinner />*/}
						<span className='relative flex size-6'>
							<span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-9 opacity-75' />
							<span className='relative inline-flex size-6 rounded-full bg-blue-8' />
						</span>
					</div>
				) : (
					<span className='text-sm text-slate-11 dark:text-slatedark-11'>
						未登录用户只能查看最近 memos
					</span>
				)}
			</button>
		</div>
	)
}
