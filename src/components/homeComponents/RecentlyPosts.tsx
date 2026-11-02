import Link from '@/components/Link'
import type { Post } from '@/services/content/core'
import type { CoreContent } from '@/services/content/utils'
import { formatDate } from '@/utils/time'

export default function RecentlyPosts({
	posts,
}: {
	posts: CoreContent<Post>[]
}) {
	return (
		<div className='relative flex flex-col'>
			<h2 className='mb-4 font-medium text-lg'>📄 最近文章</h2>
			<div className='no-scrollbar relative h-[17.5rem] list-none overflow-scroll'>
				<ol className='relative ml-4 border-blue-7 border-s-[2px] dark:border-skydark-7'>
					<li className='h-2' />
					{posts.map((post) => (
						<li
							key={post.slug}
							className='ms-6 mb-5'
						>
							<div className='-start-[7px] absolute mt-2 flex h-3 w-3 items-center justify-center rounded-full border-2 border-blue-7 bg-slate-2 dark:border-skydark-7 dark:bg-slatedark-2' />
							<Link
								href={`/${post.path}`}
								className='flex flex-row justify-between pt-1 '
							>
								<div className='truncate text-base text-slate-12 dark:text-slatedark-12'>
									{post.title}
								</div>
								<div className='shrink-0 pl-4 font-light text-slate-11 text-xs dark:text-slatedark-11'>
									{formatDate(post.date)}
								</div>
							</Link>
						</li>
					))}
					<li className='ms-6 flex min-w-max justify-between'>
						<div />
						<Link
							href='/blog'
							className='mt-2 min-w-max text-slate-11 text-sm dark:text-slatedark-11'
						>
							查看更多 &rarr;
						</Link>
					</li>
				</ol>
			</div>
		</div>
	)
}
