import { slug } from 'github-slugger'
import Link from '@/components/Link'

interface Props {
	text: string
}

const Tag = ({ text }: Props) => {
	return (
		<Link
			href={`/tags/${slug(text)}`}
			className='mt-1 mr-3 font-medium text-slate-12 text-sm uppercase hover:text-blue-11 dark:text-slatedark-12 dark:hover:text-skydark-11'
		>
			{text.split(' ').join('-')}
		</Link>
	)
}

export default Tag
