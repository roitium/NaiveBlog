'use client'

import Link from '@/components/Link'
import { memo } from 'react'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import type { Post } from '@/services/content/core'
import type { CoreContent } from '@/services/content/utils'
import { formatDate } from '@/utils/time'

interface PaginationProps {
	totalPages: number
	currentPage: number
}

interface ListLayoutProps {
	posts: CoreContent<Post>[]
	initialDisplayPosts?: CoreContent<Post>[]
	pagination?: PaginationProps
}

const MemoizedPagination = memo(function Pagination({
	totalPages,
	currentPage,
}: PaginationProps) {
	const basePath = 'blog'
	const prevPage = currentPage - 1 > 0
	const nextPage = currentPage + 1 <= totalPages

	return (
		<div className='space-y-2 pt-6 pb-8 md:space-y-5'>
			<nav className='flex justify-between'>
				{!prevPage && (
					<button
						type='button'
						className='cursor-auto disabled:opacity-50'
						disabled={!prevPage}
					>
						上一页
					</button>
				)}
				{prevPage && (
					<Link
						href={
							currentPage - 1 === 1
								? `/${basePath}/`
								: `/${basePath}/page/${currentPage - 1}`
						}
						rel='prev'
					>
						上一页
					</Link>
				)}
				<span>
					{currentPage} / {totalPages}
				</span>
				{!nextPage && (
					<button
						type='button'
						className='cursor-auto disabled:opacity-50'
						disabled={!nextPage}
					>
						下一页
					</button>
				)}
				{nextPage && (
					<Link
						href={`/${basePath}/page/${currentPage + 1}`}
						rel='next'
					>
						下一页
					</Link>
				)}
			</nav>
		</div>
	)
})

export default function PostsListLayout({
	posts,
	initialDisplayPosts = [],
	pagination,
}: ListLayoutProps) {
	const displayPosts =
		initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

	return (
		<div>
			<ul>
				{displayPosts.map((post) => {
					const { path, date, title, summary, tags, pinned } = post
					return (
						<li
							key={path}
							className='mx-auto py-5'
						>
							<article className='flex flex-col space-y-2 xl:space-y-0'>
								<dl>
									<dt className='sr-only'>Published on</dt>
									<dd className='font-medium text-base text-slate-11 leading-6 dark:text-slatedark-11'>
										<time
											dateTime={date.toISOString()}
											suppressHydrationWarning
										>
											{formatDate(date, siteMetadata.locale)}{' '}
											{pinned ? '(置顶博文)' : ''}
										</time>
									</dd>
								</dl>
								<div className='space-y-3'>
									<div>
										<h2 className='break-words font-bold text-2xl leading-8 tracking-tight'>
											<Link
												href={`/${path}`}
												className='overflow-hidden break-words text-slate-12 dark:text-slatedark-12'
											>
												{title}
											</Link>
										</h2>
										<div className='flex flex-wrap'>
											{tags?.map((tag) => (
												<Tag
													key={tag}
													text={tag}
												/>
											))}
										</div>
									</div>
									<div className=' prose-slate max-w-none text-slate-11 dark:text-slatedark-11'>
										{summary}
										<br />
										<div className='mt-3 flex items-center text-[12px]'>
											<svg
												role='img'
												aria-label='clock'
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
												strokeWidth={1.5}
												stroke='currentColor'
												className='size-[18px]'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
												/>
											</svg>
											<span>
												&nbsp; 预计阅读时长：
												{Math.ceil(post.readingTime)}
												分钟
											</span>
										</div>
									</div>
								</div>
							</article>
						</li>
					)
				})}
			</ul>
			{pagination && pagination.totalPages > 1 && (
				<MemoizedPagination
					currentPage={pagination.currentPage}
					totalPages={pagination.totalPages}
				/>
			)}
		</div>
	)
}
