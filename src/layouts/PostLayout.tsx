import ScrollTopAndComment from '@/components/ArticlePageButtonGroup'
import Image from '@/components/Image'
import PageTitle from '@/components/PageTitle'
import TOCInline from '@/components/TOC'
import '@/css/markdown.css'
import { slug as _slug } from 'github-slugger'
import { default as Link, default as NextLink } from 'next/link'
import type { ReactNode } from 'react'
import Giscus from '@/components/Comments'
import categoryMapping from '@/data/category-mapping'
import siteMetadata from '@/data/siteMetadata'
import type { TocItem } from '@/mdx-plugins/toc'
import type { Author, Post } from '@/services/content/core'
import type { CoreContent } from '@/services/content/utils'
import { cn } from '@/utils/classname'

const editUrl = (path: string) =>
	`${siteMetadata.siteContentRepo}/blob/main/blog-posts/${path.replace('blog/', '')}`

const postDateTemplate: Intl.DateTimeFormatOptions = {
	weekday: 'long',
	year: 'numeric',
	month: 'long',
	day: 'numeric',
}

interface LayoutProps {
	content: CoreContent<Post>
	authorDetails: CoreContent<Author>[]
	next?: { path: string; title: string }
	prev?: { path: string; title: string }
	children: ReactNode
	toc?: TocItem[]
}

function generateCategoryTree(categories: string[]) {
	const tree: { name: string; displayName: string; url: string }[] = []
	let nowPath = ''
	for (const category of categories) {
		nowPath += `/${category}`
		tree.push({
			name: category,
			displayName: categoryMapping[category]
				? categoryMapping[category].show
				: category,
			url: `/categories${nowPath}`,
		})
	}
	return tree
}

export default function PostLayout({
	content,
	authorDetails,
	next,
	prev,
	children,
	toc,
}: LayoutProps) {
	const { _meta, path, title, tags, pinned } = content
	let { date } = content

	// 如果 content 经过了 server component -> client component 的传递，那么 date 会被序列化成字符串，所以这里需要做一个判断。
	if (typeof date === 'string') {
		date = new Date(date)
	}

	const basePath = path.split('/')[0]
	const paths = path.split('/')
	// 去掉最后一个元素，因为它是文章名
	paths.pop()
	const categories = generateCategoryTree(paths)

	return (
		<>
			<ScrollTopAndComment toc={toc} />
			<article>
				<div className='mx-auto px-4 sm:px-6 xl:px-0'>
					<div className='flex flex-col lg:flex-row'>
						{/* 左侧边栏（桌面端）及作者信息（移动端） */}
						<div className='order-1 lg:block lg:pl-6 xl:pl-8 lg:w-[220px] 2xl:w-[280px] shrink-0'>
							<div className='lg:hidden'>
								<AuthorSection authorDetails={authorDetails} />
							</div>
							<aside className='sticky top-20 hidden lg:block'>
								<AuthorSection authorDetails={authorDetails} />
								<PostNavigation
									categories={categories}
									tags={tags}
									next={next}
									prev={prev}
									basePath={basePath}
									_slug={_slug}
								/>
							</aside>
						</div>

						{/* 主内容区域 */}
						<div className='order-2 divide-y divide-slate-5 lg:flex-1 dark:divide-slatedark-5 lg:px-8 xl:px-12 2xl:px-16 min-w-0'>
							{/* 文章头部 */}
							<PostHeader
								date={date}
								title={title}
								pinned={pinned}
								readingTime={content.readingTime}
							/>

							{/* 文章内容 */}
							<div className='prose prose-slate dark:prose-invert max-w-none pt-10 pb-8'>
								{children}
							</div>

							{/* 文章底部链接 */}
							<div className='pt-6 pb-6 text-center text-slate-11 text-sm dark:text-slatedark-11'>
								<NextLink href={editUrl(_meta.filePath)}>
									View on GitHub (If you have access)
								</NextLink>
							</div>

							{/* 评论区域 */}
							{siteMetadata.comments && (
								<div
									className='pt-6 pb-6 text-center text-slate-11 dark:text-slatedark-11'
									id='comment'
								>
									<Giscus />
								</div>
							)}
						</div>

						{/* 目录 - 右侧边栏（仅桌面显示） */}
						<div className='hidden lg:order-3 lg:block lg:w-[240px] xl:w-[280px] shrink-0 lg:pr-6 xl:pr-8'>
							<TableOfContents toc={toc} />
						</div>
					</div>

					{/* 导航区域（移动端显示在底部） */}
					<div className='mt-8 lg:hidden'>
						<PostNavigation
							categories={categories}
							tags={tags}
							next={next}
							prev={prev}
							basePath={basePath}
							_slug={_slug}
						/>
					</div>
				</div>
			</article>
		</>
	)
}

// 文章头部组件
function PostHeader({ date, title, pinned, readingTime }) {
	return (
		<header className='pt-6 lg:pb-6'>
			<div className='space-y-1 text-center'>
				<dl className='space-y-10'>
					<div>
						<dt className='sr-only'>Published on</dt>
						<dd className='font-medium text-base text-slate-11 leading-6 dark:text-slatedark-11'>
							<time dateTime={date.toISOString()}>
								{new Date(date).toLocaleDateString(
									siteMetadata.locale,
									postDateTemplate,
								)}
								{pinned ? '  (置顶博文)' : ''}
							</time>
						</dd>
					</div>
				</dl>
				<div>
					<PageTitle title={title} />
					<div className='mt-3 flex justify-center text-[12px]'>
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
						预计阅读时长：
						{Math.ceil(readingTime)}
						分钟
					</div>
				</div>
			</div>
		</header>
	)
}

// 作者信息组件
function AuthorSection({ authorDetails }) {
	return (
		<dl className='pt-6 lg:border-slate-5 lg:border-b lg:pt-11 lg:pb-10 lg:dark:border-slatedark-5'>
			<dt className='sr-only'>Authors</dt>
			<dd>
				<ul className='flex flex-wrap justify-center gap-4 sm:space-x-12 lg:block lg:space-x-0 lg:space-y-8'>
					{authorDetails.map((author) => (
						<li
							className='flex items-center space-x-2'
							key={author.name}
						>
							{author.avatar && (
								<Image
									src={author.avatar}
									width={38}
									height={38}
									alt='avatar'
									className='h-10 w-10 rounded-full'
								/>
							)}
							<dl className='whitespace-nowrap font-medium text-sm leading-5'>
								<dt className='sr-only'>Name</dt>
								<dd className='text-slate-12 dark:text-slatedark-12'>
									{author.name}
								</dd>
							</dl>
						</li>
					))}
				</ul>
			</dd>
		</dl>
	)
}

// 文章导航组件（分类、标签、上下篇文章链接）
function PostNavigation({ categories, tags, next, prev, basePath, _slug }) {
	return (
		<div className='divide-slate-5 font-medium text-sm leading-5 lg:divide-y dark:divide-slatedark-5'>
			<div className='divide-slate-5 py-4 lg:divide-y lg:py-8 dark:divide-slatedark-5'>
				{/* 分类 */}
				<div className='mb-8'>
					<h2 className='pb-2 text-slate-11 text-sm uppercase tracking-wide dark:text-slatedark-11'>
						当前分类
					</h2>
					{categories.map((category, index) => (
						<>
							<span
								key={`${category.name}_span`}
								className={cn(index !== 0 && 'mr-3')}
							>
								{index !== 0 && '>'}
							</span>
							<Link
								key={`${category.name}_link`}
								href={category.url}
								className='mr-3 font-medium text-slate-12 text-sm uppercase hover:text-blue-11 dark:text-slatedark-12 dark:hover:text-skydark-11'
							>
								{category.displayName}
							</Link>
						</>
					))}
				</div>

				{/* 标签 */}
				{tags && (
					<div className='lg:pt-8'>
						<h2 className='pb-2 text-slate-11 text-sm uppercase tracking-wide dark:text-slatedark-11'>
							标签
						</h2>
						<div className='flex flex-wrap'>
							{tags.map((tag) => (
								<NextLink
									href={`/tags/${_slug(tag)}`}
									key={tag}
									className='mt-2 mr-4 font-medium text-slate-12 text-sm uppercase hover:text-blue-11 dark:text-slatedark-12 dark:hover:text-skydark-11'
								>
									{tag.split(' ').join('-')}
								</NextLink>
							))}
						</div>
					</div>
				)}
			</div>

			{/* 上一篇和下一篇文章链接 */}
			{(next || prev) && (
				<div className='flex justify-between py-4 lg:block lg:space-y-8 lg:py-8'>
					{prev?.path && (
						<div>
							<h2 className='pb-2 text-slate-11 text-sm uppercase tracking-wide dark:text-slatedark-11'>
								上一篇
							</h2>
							<div className='text-slate-12 hover:text-blue-11 dark:text-slatedark-12 dark:hover:text-skydark-11'>
								<NextLink href={`/${prev.path}`}>{prev.title}</NextLink>
							</div>
						</div>
					)}
					{next?.path && (
						<div>
							<h2 className='pb-2 text-slate-11 text-sm uppercase tracking-wide dark:text-slatedark-11'>
								下一篇
							</h2>
							<div className='text-slate-12 hover:text-blue-11 dark:text-slatedark-12 dark:hover:text-skydark-11'>
								<NextLink href={`/${next.path}`}>{next.title}</NextLink>
							</div>
						</div>
					)}
				</div>
			)}

			{/* 返回列表页链接 */}
			<div className='pt-4 lg:pt-8'>
				<NextLink
					href={`/${basePath}`}
					className='text-slate-12 hover:text-blue-11 dark:text-slatedark-12 dark:hover:text-skydark-11'
					aria-label='回到列表页'
				>
					&larr; 回到列表页
				</NextLink>
			</div>
		</div>
	)
}

// 目录组件
function TableOfContents({ toc }) {
	return (
		<div className='prose dark:prose-invert sticky top-0 text-sm h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
			<div className='pt-20 pb-8'>
				{toc ? (
					<h2 className='not-prose ml-5 pb-2 text-lg text-slate-11 uppercase tracking-wide dark:text-slatedark-11'>
						TOC
					</h2>
				) : null}
				<TOCInline toc={toc} />
			</div>
		</div>
	)
}
