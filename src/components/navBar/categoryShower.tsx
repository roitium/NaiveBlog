import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import clsx from 'clsx'
import { FolderArchive, Package } from 'lucide-react'
import { useNavigationData } from './context'
import { memo, useState } from 'react'
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
import { cn } from '@/utils/classname'
import CategoryTreeView from '../categoryTreeView'

function CategoryDialogModal({ isOpen, setIsOpen }) {
	return (
		<Dialog
			open={isOpen}
			as='div'
			key={'categoryDialog'}
			className='relative z-10 focus:outline-hidden'
			onClose={() => setIsOpen(false)}
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
							<CategoryTreeView
								root={useNavigationData().categoryData}
								pathname={useNavigationData().pathname}
								closeFunction={() => setIsOpen(false)}
								expanded
							/>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	)
}

const CategoryDialog = memo(function CategoryDialog() {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<>
			<button
				className={clsx(
					'flex items-center gap-[6px] px-8 py-2 text-center font-medium text-slate-12 transition',
					'md:hover:bg-slate-4/90 md:hover:text-blue-11',
					'dark:text-slatedark-12 dark:hover:bg-slatedark-4/90 dark:hover:text-skydark-11',
				)}
				onClick={() => setIsOpen(true)}
			>
				<Package className='size-4' /> 分类
			</button>
			<CategoryDialogModal
				isOpen={isOpen}
				setIsOpen={setIsOpen}
			/>
		</>
	)
})

const CategoryDrawer = memo(function CategoryDrawer() {
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
				<FolderArchive className='size-4' /> 分类
			</DrawerTrigger>
			<DrawerContent aria-describedby={undefined}>
				<DrawerHeader>
					<DrawerTitle>想去哪？</DrawerTitle>
					{/* <DrawerDescription></DrawerDescription> */}
				</DrawerHeader>
				<div className='p-4'>
					<CategoryTreeView
						root={useNavigationData().categoryData}
						pathname={useNavigationData().pathname}
						closeFunction={() => setIsOpen(false)}
						expanded
					/>
				</div>
				<DrawerFooter>
					<DrawerClose>关闭</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
})

export default function CategoryShower() {
	const isMobile = useMediaQuery('(max-width: 768px)')
	return isMobile ? <CategoryDrawer /> : <CategoryDialog />
}
