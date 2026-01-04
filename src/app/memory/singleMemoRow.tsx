import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import LightGallery from 'lightgallery/react'
import Image from 'next/image'
import { memo, useMemo, useState } from 'react'
import { toast } from 'sonner'
import Logo from '@/public/static/images/logo.png'
import type { ApiMemo } from '@/types/memos'
import { formatToSemanticTime } from '@/utils/time'
import { fetchComments } from './fetchFunctions'
import { CommentsList } from './memoComments'

/**
 * 单Memo组件
 */
export const MemoRowComponent = memo(function MemoRowComponent({
	memo,
}: {
	memo: ApiMemo
}) {
	const [showComments, setShowComments] = useState(false)
	const [comments, setComments] = useState<ApiMemo['replies']>([])
	const [isLoadingComments, setIsLoadingComments] = useState(false)

	const memoizedImage = useMemo(
		() => (
			<Image
				src={Logo}
				alt='avatar'
				className='mt-1 size-[40px] rounded-full'
			/>
		),
		[],
	)

	const handleCommentClick = async (memoOrCommentId: string) => {
		if (showComments) {
			setShowComments(false)
			return
		}
		setIsLoadingComments(true)
		try {
			const newComments = await fetchComments(memoOrCommentId)
			setComments(newComments)
			setShowComments(true)
		} catch (error) {
			toast.error('获取评论失败')
			console.error(error)
		} finally {
			setIsLoadingComments(false)
		}
	}

	return (
		<div className='flex max-w-full flex-col gap-3 border-slate-6 py-6 md:mx-auto md:w-[720px] dark:border-slatedark-6'>
			{/* 头像、日期、名称 */}
			<div className='flex justify-between gap-3'>
				{memoizedImage}
				<div className='flex flex-col'>
					<span className='font-medium text-slate-12 dark:text-slatedark-12'>
						Roitium.
					</span>
					<span className='text-slate-11 text-xs dark:text-slatedark-11'>
						{formatToSemanticTime(memo.createdAt, navigator.language)}
					</span>
				</div>
				{memo.replies.length > 0 ? (
					<div className='ml-auto flex gap-3'>
						<button
							onClick={() => handleCommentClick(memo.id)}
							className='inline-block self-center align-middle transition hover:opacity-30'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={1.5}
								stroke='currentColor'
								className='inline-block size-5 align-middle'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z'
								/>
							</svg>
							<span className='align-middle'>{memo.replies.length}</span>
						</button>
						<div className='ml-auto select-none self-center text-base'>
							{memo.isPinned ? '📌' : null}
						</div>
					</div>
				) : (
					<div className='ml-auto select-none self-center text-base'>
						{memo.isPinned ? '📌' : null}
					</div>
				)}
			</div>
			{/* 内容框 */}
			<div className='prose prose-slate dark:prose-invert prose-p:my-2 ml-[52px] rounded-e-lg rounded-bl-lg bg-slate-3 pr-2 pl-2 text-slate-12 shadow-xs ring-1 ring-slate-7/50 dark:bg-slatedark-3 dark:text-slatedark-12 dark:ring-slatedark-7/50'>
				{memo.content ? (
					<article
						className='break-words'
						// biome-ignore lint/security/noDangerouslySetInnerHtml: ignore it
						dangerouslySetInnerHTML={{ __html: memo.content }}
					/>
				) : (
					''
				)}
				{memo.resources.length > 0 ? (
					<LightGallery
						speed={500}
						plugins={[lgThumbnail, lgZoom]}
						elementClassNames='flex flex-row gap-2 flex-wrap not-prose mt-4 mb-3 mr-2'
						licenseKey={process.env.NEXT_PUBLIC_LIGHT_GALLERY_LICENSE_KEY}
					>
						{memo.resources.map((resource) => {
							if (!resource.externalLink) {
								return null
							}
							return (
								<a
									href={resource.externalLink}
									key={resource.filename}
								>
									<img
										alt={resource.filename}
										src={resource.externalLink}
										height={128}
										width={128}
										className='h-36 w-36 rounded-xl border object-cover shadow-xs hover:shadow-xl'
									/>
								</a>
							)
						})}
					</LightGallery>
				) : null}
			</div>
			{/* 评论区 */}
			{isLoadingComments && (
				<div className='mx-auto mt-3 w-6'>
					<span className='relative flex size-6'>
						<span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-9 opacity-75' />
						<span className='relative inline-flex size-6 rounded-full bg-blue-8' />
					</span>
				</div>
			)}
			{showComments && !isLoadingComments && (
				<div className='mt-4 ml-[52px]'>
					<CommentsList
						comments={comments}
						onCommentClick={handleCommentClick}
					/>
				</div>
			)}
		</div>
	)
})
