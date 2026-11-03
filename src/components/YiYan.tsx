/*调用一言接口获取不同的简介内容*/

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function YiYan() {
	const [data, setData] = useState<{ hitokoto: string; from: string }>({
		hitokoto: '加载中...',
		from: '',
	})

	useEffect(() => {
		fetch('https://international.v1.hitokoto.cn')
			.then((response) => response.json())
			.then((data) => setData(data))
			.catch(() => {
				toast.error('获取一言失败！你运气太差了喵！')
				setData({ hitokoto: '获取失败', from: '' })
			})
	}, [])

	return (
		<div>
			{data.hitokoto} {data.from ? `——${data.from}` : ''}
		</div>
	)
}
