import siteMetadata from '@/data/siteMetadata'
export default function Footer() {
	const built = new Date(import.meta.env.PUBLIC_BUILD_TIME)
	return (
		<footer>
			<div className='mt-16 mb-8 flex select-none flex-col items-center'>
				<span className='mb-2 text-gray-500 text-sm dark:text-neutral-400'>
					{'Ciallo ～(∠・ω< )⌒★!'}
				</span>
				<div className='mb-2 flex space-x-2 text-gray-500 text-sm dark:text-neutral-400'>
					<span>{siteMetadata.author}</span>
					<span> • </span>
					<span>© {built.getFullYear()}</span>
					<span> • </span>
					<span>{siteMetadata.title}</span>
				</div>
				<span
					className='text-gray-500 text-sm dark:text-neutral-400'
					title={`最近一次提交 hash: ${import.meta.env.PUBLIC_COMMIT_HASH?.slice(0, 6) || 'unknown'}`}
				>
					构建时间：{built.toUTCString()}
				</span>
			</div>
		</footer>
	)
}
