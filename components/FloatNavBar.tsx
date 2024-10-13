'use client'
import {
  AboutMeIcon,
  HomeIcon,
  MemoriesIcon,
  PostsIcon,
  ProjectsIcon,
} from '@/components/svgs/navBarIcons'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import Link from './Link'
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
      { href: '/blog/categories', title: '📦 分类' },
      { href: '/blog/tags', title: '🏷 标签' },
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
      { href: '/blog/categories', title: '📦 分类' },
      { href: '/blog/tags', title: '🏷 标签' },
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
  text: selected
    ? 'block font-medium text-primary-500 py-3 border-b border-b-primary-500 cursor-pointer'
    : 'transition-colors block font-medium hover:text-primary-500 dark:hover:text-primary-500 text-neutral-800 dark:text-neutral-100 py-3 cursor-pointer',
  icon: selected
    ? 'text-primary-500 py-2 border-b border-b-primary-500 cursor-pointer'
    : 'transition-colors text-neutral-800 dark:hover:text-primary-500 hover:text-primary-500 dark:text-neutral-100 py-2 cursor-pointer',
})

// 通用Popover生成器
const generatePopover = (link: HeaderNavLinkWithChildren, nowPath: string, iconMode: boolean) => (
  <Popover key={`${link.title}_popover`} className="my-auto">
    <PopoverButton
      key={`${link.title}_popover_btn`}
      className={buttonStyles(isOnThisPage(link, nowPath))[iconMode ? 'icon' : 'text']}
      as={'div'}
      aria-label={`popover button for ${link.title}`}
    >
      {iconMode ? link.logo : link.title}
    </PopoverButton>
    <PopoverPanel
      transition
      anchor={{ to: 'bottom', gap: 12 }}
      className=" rounded-xl bg-neutral-50/90 text-sm/6 shadow-md backdrop-blur-sm transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)] data-[closed]:-translate-y-1 data-[closed]:opacity-0 dark:bg-neutral-700/90"
    >
      {link.children.map((child) => (
        <Link
          key={child.title}
          className="block px-8 py-2 text-center font-medium text-neutral-800 transition hover:text-primary-500 dark:text-neutral-100 dark:hover:bg-primary-100/20 dark:hover:text-primary-500"
          href={child.href}
        >
          {child.title}
        </Link>
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
    <div className="fixed inset-x-0 top-10 z-[100] mx-auto flex max-w-fit items-center justify-center rounded-full bg-neutral-50/90 px-5 leading-5 shadow-md ring-1 ring-neutral-200/90 backdrop-blur-sm dark:bg-neutral-700/90 dark:ring-neutral-500/90 md:space-x-4">
      <div className="no-scrollbar hidden items-center space-x-4 overflow-x-auto md:flex md:space-x-8">
        {headerNavLinksNewVersion.map((link) => singleNavButtonComponent(link, false, nowPath))}
        <SearchButton />
      </div>
      <div className="no-scrollbar flex justify-between gap-[28px] overflow-x-auto sm:gap-6 md:hidden">
        {headerNavLinksNewVersion.map((link) => singleNavButtonComponent(link, true, nowPath))}
        <SearchButton />
      </div>
    </div>
  )
}

export default FloatNavBar
