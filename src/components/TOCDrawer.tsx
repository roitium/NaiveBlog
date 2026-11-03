import { TableOfContents } from 'lucide-react'
import TOCInline, { type TOCInlineProps } from './TOC'
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from './ui/drawer'

type TOCDrawerProps = TOCInlineProps

export const TOCDrawer = ({ toc, ...props }: TOCDrawerProps) => {
	return (
		<Drawer>
			<DrawerTrigger
				aria-label='打开目录'
				className='rounded-full bg-gray-200 p-2 text-gray-500 transition-all hover:bg-gray-300 lg:hidden dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
			>
				<TableOfContents className='size-5' />
			</DrawerTrigger>
			<DrawerContent aria-describedby={undefined}>
				<DrawerHeader>
					<DrawerTitle>目录</DrawerTitle>
				</DrawerHeader>
				<div className='prose dark:prose-invert prose-li:my-1 prose-ul:my-1 overflow-y-auto px-4 prose-li:text-sm prose-ul:text-sm'>
					<TOCInline
						toc={toc}
						{...props}
					/>
				</div>
				<DrawerFooter>
					<DrawerClose aria-label='关闭目录'>关闭</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
}
