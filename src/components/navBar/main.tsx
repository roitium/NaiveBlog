import {
	CloseButton,
	Popover,
	PopoverButton,
	PopoverPanel,
} from '@headlessui/react'
import { cva } from 'class-variance-authority'
import clsx from 'clsx'
import {
	Cloud,
	FileText,
	HelpCircle,
	Home,
	Monitor,
	PenTool,
} from 'lucide-react'
import Link from '@/components/Link'
import { useNavigationData } from './context'
import type { ReactElement, ReactNode } from 'react'
import SearchButton from '../SearchButton'
import CategoryShower from './categoryShower'
import TagShower from './tagShower'

interface HeaderNavLink {
	href: string
	title: string
	hrefComponent?: ReactElement // 用于自定义链接
	logo?: ReactNode
	children?: HeaderNavLink[]
}

interface HeaderNavLinkWithChildren extends Omit<HeaderNavLink, 'children'> {
	children: HeaderNavLink[]
}

const headerNavLinksNewVersion: HeaderNavLink[] = [
	{ href: '/', title: '主页', logo: <Home className='size-4' /> },
	{
		href: '/blog',
		title: '文章',
		logo: <PenTool className='size-4' />,
		children: [
			{ href: '/blog', title: '所有', logo: <FileText className='size-4' /> },
			// { href: '/categories', title: 'Categories', logo: <Package className="size-4" /> },
			// { href: '/tags', title: 'Tags', logo: <Tag className="size-4" /> },
		],
	},
	{ href: '/memory', title: '回忆', logo: <Cloud className='size-4' /> },
	{ href: '/projects', title: '项目', logo: <Monitor className='size-4' /> },
	{ href: '/about', title: '关于', logo: <HelpCircle className='size-4' /> },
]

// 判断当前路径是否与链接匹配
function isOnThisPage(link: HeaderNavLink, nowPath: string) {
	return (
		(nowPath.startsWith(link.href) && link.href !== '/') ||
		(nowPath === '/' && link.href === '/')
	)
}

const buttonVariants = cva(
	['cursor-pointer', 'hover:text-blue-11', 'dark:hover:text-skydark-11'],
	{
		variants: {
			variant: {
				text: ['block', 'font-medium', 'py-3'],
				icon: ['py-2'],
			},
			selected: {
				true: [
					'text-blue-11',
					'dark:text-skydark-11',
					'border-b',
					'border-b-blue-11',
					'dark:border-b-skydark-11',
				],
				false: ['text-slate-12', 'dark:text-slatedark-12'],
			},
		},
		defaultVariants: {
			variant: 'text',
			selected: false,
		},
	},
)

// 按钮样式生成
const buttonStyles = (selected: boolean) => ({
	text: buttonVariants({ variant: 'text', selected }),
	icon: buttonVariants({ variant: 'icon', selected }),
})

const generatePopoverButton = (child: HeaderNavLink) => {
	// if (child.hrefComponent) {
	//   return child.hrefComponent
	// }
	return (
		<CloseButton
			as={Link}
			key={child.title}
			className={clsx(
				'block px-8 py-2 text-center font-medium text-slate-12 transition',
				'md:hover:bg-slate-4/90 md:hover:text-blue-11',
				'dark:text-slatedark-12 dark:hover:bg-slatedark-4/90 dark:hover:text-skydark-11',
			)}
			href={child.href}
		>
			<div className='flex items-center gap-[6px]'>
				{child.logo}
				<span>{child.title}</span>
			</div>
		</CloseButton>
	)
}

// 通用Popover生成器
const generatePopover = (
	link: HeaderNavLinkWithChildren,
	nowPath: string,
	iconMode: boolean,
) => (
	<Popover
		key={`${link.title}_popover`}
		className={clsx('my-auto')}
	>
		<PopoverButton
			key={`${link.title}_popover_btn`}
			aria-label={link.title}
			className={
				buttonStyles(isOnThisPage(link, nowPath))[iconMode ? 'icon' : 'text']
			}
			as={'button'}
		>
			{iconMode ? (
				link.logo
			) : (
				<div className='flex items-center gap-[6px]'>
					{link.logo}
					<span>{link.title}</span>
				</div>
			)}
		</PopoverButton>
		<PopoverPanel
			key={`${link.title}_popover_panel`}
			transition
			anchor={{ to: 'bottom', gap: 12 }}
			className={clsx(
				'rounded-xl bg-slate-2/90 text-sm shadow-md backdrop-blur-xs transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)]',
				'dark:bg-slatedark-2/90',
				'data-closed:-translate-y-1 data-closed:opacity-0',
			)}
		>
			{link.children.map((child) => generatePopoverButton(child))}
			<CategoryShower />
			<TagShower />
		</PopoverPanel>
	</Popover>
)

// 生成导航按钮
function singleNavButtonComponent(
	link: HeaderNavLink,
	iconMode: boolean,
	nowPath: string,
) {
	if (link.children) {
		return generatePopover(link as HeaderNavLinkWithChildren, nowPath, iconMode)
	}
	return (
		<Link
			key={link.title}
			href={link.href}
			aria-label={link.title}
			className={
				buttonStyles(isOnThisPage(link, nowPath))[iconMode ? 'icon' : 'text']
			}
		>
			{iconMode ? (
				link.logo
			) : (
				<div className='flex items-center gap-[6px]'>
					{link.logo}
					<span>{link.title}</span>
				</div>
			)}
		</Link>
	)
}

const FloatNavBar = () => {
	const nowPath = useNavigationData().pathname

	return (
		<div
			className={clsx(
				'fixed inset-x-0 top-5 z-100 mx-auto flex max-w-fit items-center justify-center rounded-full bg-slate-2/90 px-5 leading-5 shadow-md shadow-slate-9/50 ring-1 ring-slate-7/50 backdrop-blur-xs',
				'dark:bg-slatedark-3/90 dark:shadow-slatedark-9/50 dark:ring-slatedark-7/50',
			)}
		>
			<div
				className={clsx(
					'no-scrollbar hidden items-center space-x-4 overflow-x-auto',
					'md:flex md:space-x-8',
				)}
			>
				{headerNavLinksNewVersion.map((link) =>
					singleNavButtonComponent(link, false, nowPath),
				)}
				<SearchButton />
			</div>
			<div
				className={clsx(
					'no-scrollbar flex justify-between gap-[28px] overflow-x-auto',
					'sm:gap-6',
					'md:hidden',
				)}
			>
				{headerNavLinksNewVersion.map((link) =>
					singleNavButtonComponent(link, true, nowPath),
				)}
				<SearchButton />
			</div>
		</div>
	)
}

export default FloatNavBar
