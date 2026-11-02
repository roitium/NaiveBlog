import { Mail, Rss } from 'lucide-react'
import { Github } from './svgs/social-icons/icons'
import {
	TooltipProvider,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from './ui/tooltip'
import Link from './Link'
import site from '@/data/siteMetadata'
export default function HomeSocial() {
	return (
		<TooltipProvider delayDuration={0}>
			<div className='mb-3 flex justify-center space-x-4'>
				{[
					{ label: 'Email', href: `mailto:${site.email}`, Icon: Mail },
					{ label: 'Github', href: site.github, Icon: Github },
					{ label: 'RSS', href: '/feed.xml', Icon: Rss },
				].map(({ label, href, Icon }) => (
					<Tooltip key={label}>
						<TooltipTrigger asChild>
							<Link
								href={href}
								aria-label={label}
							>
								<Icon className='size-6' />
							</Link>
						</TooltipTrigger>
						<TooltipContent side='bottom'>{label}</TooltipContent>
					</Tooltip>
				))}
			</div>
		</TooltipProvider>
	)
}
