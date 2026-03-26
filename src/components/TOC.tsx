'use client'
import { type JSX, useEffect, useRef, useState } from 'react'
import type { Toc, TocItem } from '@/mdx-plugins/toc'

export interface TOCInlineProps {
	toc?: Toc
	fromHeading?: number
	toHeading?: number
	asDisclosure?: boolean
	exclude?: string | string[]
	collapse?: boolean
}

export interface NestedTocItem extends TocItem {
	children?: NestedTocItem[]
}

export const createNestedList = (items: TocItem[]): NestedTocItem[] => {
	const nestedList: NestedTocItem[] = []
	const stack: NestedTocItem[] = []

	for (const item of items) {
		const newItem: NestedTocItem = { ...item, children: [] }

		while (stack.length > 0 && stack[stack.length - 1].depth >= newItem.depth) {
			stack.pop()
		}

		const parent = stack.length > 0 ? stack[stack.length - 1] : null

		if (parent) {
			parent.children = parent.children || []
			parent.children.push(newItem)
		} else {
			nestedList.push(newItem)
		}

		stack.push(newItem)
	}

	return nestedList
}

/**
 * Generates an inline table of contents
 * Exclude titles matching this string (new RegExp('^(' + string + ')$', 'i')).
 * If an array is passed the array gets joined with a pipe (new RegExp('^(' + array.join('|') + ')$', 'i')).
 *
 * `asDisclosure` will wrap the TOC in a `details` element with a `summary` element.
 * `collapse` will collapse the TOC when `AsDisclosure` is true.
 *
 * If you are using tailwind css and want to revert to the default HTML list style, set `ulClassName="[&_ul]:list-[revert]"`
 * @param {TOCInlineProps} {
 *   toc,
 *   fromHeading = 1,
 *   toHeading = 6,
 *   asDisclosure = false,
 *   exclude = '',
 *   collapse = false,
 *   ulClassName = '',
 *   liClassName = '',
 * }
 *
 */
const TOCInline = ({
	toc,
	fromHeading = 1,
	toHeading = 6,
	asDisclosure = false,
	exclude = '',
	collapse = false,
}: TOCInlineProps) => {
	const [activeId, setActiveId] = useState<string | null>(null)
	const observer = useRef<IntersectionObserver | null>(null)
	const lastIntersectingId = useRef<string | null>(null)
	const clickedId = useRef<string | null>(null)

	useEffect(() => {
		if (!toc) {
			return
		}

		const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
		// 确保 headings 存在才继续
		if (headings.length === 0) {
			return
		}

		observer.current = new IntersectionObserver(
			(entries) => {
				const intersectingHeadings: { id: string; ratio: number }[] = []
				for (const entry of entries) {
					if (entry.isIntersecting) {
						intersectingHeadings.push({
							id: entry.target.id,
							ratio: entry.intersectionRatio,
						})
					}
				}

				if (intersectingHeadings.length > 0) {
					intersectingHeadings.sort((a, b) => b.ratio - a.ratio)
					lastIntersectingId.current = intersectingHeadings[0].id
					if (!clickedId.current) setActiveId(lastIntersectingId.current)
				}
			},
			{
				rootMargin: '-80px 0px 0px 0px', // 视口顶部偏移 80px
				threshold: 0.9, // 90% 可见时触发
			},
		)

		for (const heading of headings) {
			observer.current?.observe(heading)
		}

		// 清理函数
		return () => {
			observer.current?.disconnect()
		}
	}, [toc])

	useEffect(() => {
		if (activeId) {
			const tocItem = document.getElementById(`toc-item-${activeId}`)
			if (tocItem) {
				// 找到最近的滚动父元素
				let parent = tocItem.parentElement
				while (parent && parent !== document.body) {
					const overflowY = window.getComputedStyle(parent).overflowY
					if (overflowY === 'auto' || overflowY === 'scroll') {
						const parentRect = parent.getBoundingClientRect()
						const targetRect = tocItem.getBoundingClientRect()
						const offset = targetRect.top - parentRect.top - parent.clientHeight / 2 + tocItem.clientHeight / 2
						parent.scrollBy({ top: offset, behavior: 'smooth' })
						break
					}
					parent = parent.parentElement
				}
			}
		}
	}, [activeId])

	// 在 Hooks 调用之后处理早期返回
	if (!toc) {
		return null
	}

	const re = Array.isArray(exclude)
		? new RegExp(`^(${exclude.join('|')})$`, 'i')
		: new RegExp(`^(${exclude})$`, 'i')

	const filteredToc = toc.filter((heading) => {
		// 确保 heading.value 存在且是字符串
		const headingValue = heading.value || ''
		const isExcluded = exclude ? re.test(headingValue) : false
		const isWithinRange =
			heading.depth >= fromHeading && heading.depth <= toHeading

		if (isExcluded) {
			return false
		}

		return isWithinRange
	})

	// 如果过滤后没有内容，也可以选择返回 null
	if (filteredToc.length === 0) {
		return null
	}

	const handleItemClick = (id: string) => {
		clickedId.current = id
		setActiveId(id)
		
		// eslint-disable-next-line react-compiler/react-compiler
		window.location.hash = `#${id}`
		const targetElement = document.getElementById(id)
		if (targetElement) {
			targetElement.scrollIntoView({
				behavior: 'smooth', // 平滑滚动
			})
		}
		// 清除 clickedId 状态，以便 IntersectionObserver 可以再次更新 activeId
		setTimeout(() => {
			clickedId.current = null
		}, 500)
	}

	const createList = (
		items: NestedTocItem[] | undefined,
	): JSX.Element | null => {
		if (!items || items.length === 0) {
			return null
		}

		return (
			<ul className={''}>
				{items.map((item, index) => (
					<li key={`${item.url}_${index}`}>
						<a
							id={`toc-item-${item.url.slice(1)}`}
							className={`underline-offset-2 ${
								activeId === item.url.slice(1)
									? 'font-semibold text-blue-11 dark:text-skydark-11'
									: 'text-slate-11 hover:text-blue-11 dark:text-slatedark-11 dark:hover:text-skydark-11'
							}`}
							href={item.url}
							onClick={(e) => {
								e.preventDefault() // 阻止默认的锚点跳转
								handleItemClick(item.url.slice(1))
							}}
						>
							{item.value}
						</a>
						{/* 递归调用渲染子列表 */}
						{createList(item.children)}
					</li>
				))}
			</ul>
		)
	}

	const nestedList = createNestedList(filteredToc)

	return (
		<>
			{asDisclosure ? (
				<details
					className='h-min'
					open={!collapse}
				>
					<summary className='ml-6 pt-2 pb-2 font-bold text-xl'>目录</summary>
					<div className='ml-6'>{createList(nestedList)}</div>
				</details>
			) : (
				createList(nestedList)
			)}
		</>
	)
}

export default TOCInline
