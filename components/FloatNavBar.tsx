'use client'
import {
  AboutMeIcon,
  HomeIcon,
  MemoriesIcon,
  PostsIcon,
  ProjectsIcon,
} from '@/components/svgs/navBarIcons'
import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import SearchButton from './SearchButton'

interface HeaderNavLink {
  href: string
  title: string
  logo?: ReactNode
  children?: HeaderNavLink[]
}

interface HeaderNavLinkWithChildren extends Omit<HeaderNavLink, 'children'> {
  children: HeaderNavLink[]
}

const headerNavLinks: HeaderNavLink[] = [
  { href: '/', title: '🏠 主页', logo: <HomeIcon /> },
  {
    href: '/blog',
    title: '✍️ 文章',
    logo: <PostsIcon />,
    children: [
      { href: '/blog', title: '📄 所有' },
      { href: '/categories', title: '📦 分类' },
      { href: '/tags', title: '🏷 标签' },
    ],
  },
  { href: '/memory', title: '☁️ 回忆', logo: <MemoriesIcon /> },
  { href: '/projects', title: '🖥 项目', logo: <ProjectsIcon /> },
  { href: '/about', title: '❔ 关于', logo: <AboutMeIcon /> },
]

const headerNavLinksNewVersion: HeaderNavLink[] = [
  { href: '/', title: '🏠 主页', logo: '🏠' },
  {
    href: '/blog',
    title: '✍️ 文章',
    logo: '✍️',
    children: [
      { href: '/blog', title: '📄 所有' },
      { href: '/categories', title: '📦 分类' },
      { href: '/tags', title: '🏷 标签' },
    ],
  },
  { href: '/memory', title: '☁️ 回忆', logo: '☁️' },
  { href: '/projects', title: '🖥 项目', logo: '🖥' },
  { href: '/about', title: '❔ 关于', logo: '❔' },
]

// 判断当前路径是否与链接匹配
function isOnThisPage(link: HeaderNavLink, nowPath: string) {
  return (nowPath.startsWith(link.href) && link.href != '/') || (nowPath == '/' && link.href == '/')
}

// 按钮样式生成器
const buttonStyles = (selected: boolean) => ({
  text: clsx(
    'block font-medium py-3 cursor-pointer',
    'hover:text-light-highlight-text dark:hover:text-primary-400',
    selected
      ? 'text-light-highlight-text dark:text-primary-400 border-b border-b-light-highlight-text dark:border-b-primary-400'
      : 'text-gray-800 dark:text-neutral-100'
  ),
  icon: clsx(
    'py-2 cursor-pointer',
    'hover:text-light-highlight-text dark:hover:text-primary-400',
    selected
      ? 'text-light-highlight-text dark:text-primary-400 border-b border-b-light-highlight-text dark:border-b-primary-400'
      : 'text-gray-800 dark:text-neutral-100'
  ),
})

// 通用Popover生成器
const generatePopover = (link: HeaderNavLinkWithChildren, nowPath: string, iconMode: boolean) => (
  <Popover key={`${link.title}_popover`} className={clsx('my-auto')}>
    <PopoverButton
      key={`${link.title}_popover_btn`}
      role={'button'}
      className={buttonStyles(isOnThisPage(link, nowPath))[iconMode ? 'icon' : 'text']}
      as={'div'}
    >
      {iconMode ? link.logo : link.title}
    </PopoverButton>
    <PopoverPanel
      transition
      anchor={{ to: 'bottom', gap: 12 }}
      className={clsx(
        'rounded-xl bg-neutral-100/90 text-sm shadow-md backdrop-blur-sm transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)]',
        'dark:bg-neutral-700/90',
        'data-[closed]:-translate-y-1 data-[closed]:opacity-0'
      )}
    >
      {link.children.map((child) => (
        <CloseButton
          as={Link}
          key={child.title}
          className={clsx(
            'block px-8 py-2 text-center font-medium text-gray-800 transition',
            'md:hover:bg-primary-50/80 md:hover:text-light-highlight-text',
            'dark:text-neutral-100 dark:hover:bg-primary-50/20 dark:hover:text-primary-500'
          )}
          href={child.href}
        >
          {child.title}
        </CloseButton>
      ))}
    </PopoverPanel>
  </Popover>
)

// 生成导航按钮
function singleNavButtonComponent(link: HeaderNavLink, iconMode: boolean, nowPath: string) {
  if (link.children) {
    return generatePopover(link as HeaderNavLinkWithChildren, nowPath, iconMode)
  }
  return (
    <Link
      key={link.title}
      href={link.href}
      className={buttonStyles(isOnThisPage(link, nowPath))[iconMode ? 'icon' : 'text']}
    >
      {iconMode ? link.logo : link.title}
    </Link>
  )
}

const FloatNavBar = () => {
  const nowPath = usePathname()

  return (
    <div
      className={clsx(
        `fixed inset-x-0 top-5 z-[100] mx-auto flex max-w-fit items-center justify-center
        rounded-full bg-gray-100/90 px-5 leading-5 shadow-md shadow-gray-100/90 ring-1 ring-gray-200/90 backdrop-blur-sm`,
        'dark:bg-neutral-600/90 dark:shadow-neutral-600/90 dark:ring-neutral-500/90',
        'md:space-x-4'
      )}
    >
      <div
        className={clsx(
          'no-scrollbar hidden items-center space-x-4 overflow-x-auto',
          'md:flex md:space-x-8'
        )}
      >
        {headerNavLinksNewVersion.map((link) => singleNavButtonComponent(link, false, nowPath))}
        <SearchButton />
      </div>
      <div
        className={clsx(
          'no-scrollbar flex justify-between gap-[28px] overflow-x-auto',
          'sm:gap-6',
          'md:hidden'
        )}
      >
        {headerNavLinksNewVersion.map((link) => singleNavButtonComponent(link, true, nowPath))}
        <SearchButton />
      </div>
    </div>
  )
}

export default FloatNavBar
