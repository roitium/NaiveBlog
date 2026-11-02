import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import clsx from 'clsx'
import { TagIcon } from 'lucide-react'
import Link from '@/components/Link'
import { memo, useCallback, useState } from 'react'
import useMediaQuery from '@/hooks/useMediaQuery'
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer'
import { useNavigationData } from './context'
import { cn } from '@/utils/classname'
import Tag from '../Tag'

function TagsContent({ close }) {
	const tagCounts = useNavigationData().tagData
	const tagKeys = Object.keys(tagCounts)
	const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
	return (
		<div className='mx-auto flex w-full flex-wrap justify-center pt-3'>
			{tagKeys.length === 0 && '你还没有标签'}
			{sortedTags.map((t) => {
				return (
					<div
						key={t}
						onClick={close}
						role='button'
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter') close()
						}}
						className='mt-2 mr-5 mb-2'
					>
						<Tag text={t} />
						<Link
							href={`/tags/${t}`}
							className='-ml-2 font-semibold text-gray-600 text-sm uppercase dark:text-gray-300'
							aria-label={`View posts tagged ${t}`}
						>
							{` (${tagCounts[t]})`}
						</Link>
					</div>
				)
			})}
		</div>
	)
}

function TagDialogModal({ isOpen, setIsOpen }) {
	const handleClose = useCallback(() => {
		setIsOpen(false)
	}, [setIsOpen])

	return (
		<Dialog
			open={isOpen}
			as='div'
			key={'tagDialog'}
			className='relative z-10 focus:outline-hidden'
			onClose={handleClose}
		>
			<div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
				<div className='flex min-h-full items-center justify-center p-4'>
					<DialogPanel
						transition
						className={clsx(
							'w-full max-w-md rounded-xl bg-white/5 p-6 text-gray-800 backdrop-blur-2xl duration-300 ease-out',
							'ring-1 ring-gray-200/90',
							'data-closed:transform-[scale(95%)] data-closed:opacity-0',
						)}
					>
						<DialogTitle
							as='h3'
							className='font-medium text-base/7 text-gray-800 dark:text-gray-200'
						>
							想去哪？
						</DialogTitle>
						<div className='mt-4'>
							<TagsContent close={handleClose} />
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	)
}

const TagDialog = memo(function TagDialog() {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<>
			<button
				className={clsx(
					'flex justify-center gap-[6px] px-8 py-2 text-center font-medium text-slate-12 transition',
					'md:hover:bg-slate-4/90 md:hover:text-blue-11',
					'dark:text-slatedark-12 dark:hover:bg-slatedark-4/90 dark:hover:text-skydark-11',
				)}
				onClick={() => setIsOpen(true)}
			>
				<TagIcon className='size-4' /> 标签
			</button>
			<TagDialogModal
				isOpen={isOpen}
				setIsOpen={setIsOpen}
			/>
		</>
	)
})

const TagDrawer = memo(function TagDrawer() {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<Drawer
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DrawerTrigger
				className={cn(
					'flex justify-center gap-[6px] px-8 py-2 text-center font-medium text-slate-12 transition',
					'md:hover:bg-slate-4/90 md:hover:text-blue-11',
					'dark:text-slatedark-12 dark:hover:bg-slatedark-4/90 dark:hover:text-skydark-11',
				)}
			>
				<TagIcon className='size-4' /> 标签
			</DrawerTrigger>
			<DrawerContent aria-describedby={undefined}>
				<DrawerHeader>
					<DrawerTitle>想去哪？</DrawerTitle>
					{/* <DrawerDescription></DrawerDescription> */}
				</DrawerHeader>
				<div className='p-4'>
					<TagsContent close={() => setIsOpen(false)} />
				</div>
				<DrawerFooter>
					<DrawerClose>关闭</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
})

export default function TagShower() {
	const isMobile = useMediaQuery('(max-width: 768px)')
	return isMobile ? <TagDrawer /> : <TagDialog />
}
