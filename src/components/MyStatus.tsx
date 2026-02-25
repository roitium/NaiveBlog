'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
// import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

enum StatusCode {
	Online = 1,
	Offline = 2,
}

/*
let reconnectFrequencySeconds = 1
let evtSource: EventSource

function reconnectFunc(url: string, setStatus: SetStatus) {
	setTimeout(() => {
		setupEventSource(url, setStatus)
	}, reconnectFrequencySeconds * 1000)

	reconnectFrequencySeconds *= 2
	if (reconnectFrequencySeconds >= 64) {
		reconnectFrequencySeconds = 64
	}
}
*/

interface Status {
	status: string
	software: string
	timestamp: string
	message: string
	status_code: StatusCode
}

/*
type SetStatus = React.Dispatch<React.SetStateAction<Status>>

function setupEventSource(url: string, setStatus: SetStatus) {
	evtSource = new EventSource(url)
	if (evtSource.readyState === evtSource.CLOSED) return
	evtSource.onmessage = (e: MessageEvent) => {
		// console.log(e.data)
		setStatus(JSON.parse(e.data))
	}
	evtSource.onopen = () => {
		toast.success('成功连接到状态服务器', { position: 'bottom-right' })
		reconnectFrequencySeconds = 1
	}
	evtSource.onerror = () => {
		toast.error('连接状态服务器失败，重试中', { position: 'bottom-right' })
		evtSource.close()
		reconnectFunc(url, setStatus)
	}
}
*/

export default function MyStatus() {
	const [status] = useState<Status>({
		message: '该功能暂时关闭',
		status: 'disabled',
		software: 'disabled',
		timestamp: 'disabled',
		status_code: StatusCode.Offline,
	})

	useEffect(() => {
		// 功能暂时关闭，不发送 sse 网络请求
		/*
		if (!process.env.NEXT_PUBLIC_STATUS_EVENT_SOURCE) {
			return
		}
		setupEventSource(process.env.NEXT_PUBLIC_STATUS_EVENT_SOURCE, setStatus)
		return () => {
			evtSource.close()
		}
		*/
	}, [])

	return (
		<Tooltip>
			<TooltipTrigger
				className={clsx(
					'absolute rounded-full ring-2 ring-slate-7 md:right-10 md:bottom-4 md:size-6 dark:ring-slatedark-7',
					status.status_code === StatusCode.Online
						? 'bg-grass-9 dark:bg-grassdark-9'
						: 'bg-gray-10 dark:bg-graydark-6',
					// 别问，问就是工匠精神，逐像素调整
					'right-[34px] bottom-[14px] size-5',
				)}
			/>
			<TooltipContent
				side='bottom'
				className='TooltipContent mt-2 whitespace-pre-line bg-slate-3 text-center text-slate-12 ring-1 ring-slate-7 dark:bg-slatedark-3 dark:text-slatedark-12 dark:ring-slatedark-7'
			>
				该功能暂时关闭
			</TooltipContent>
		</Tooltip>
	)
}
