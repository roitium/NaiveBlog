import { useState } from 'react'
import { withBase } from '@/utils/paths'

export default function ArticlePasswordForm({ slug }: { slug: string }) {
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState('')
	const [pending, setPending] = useState(false)
	async function unlock(event: React.FormEvent) {
		event.preventDefault()
		if (pending) return
		setPending(true)
		setMessage('')
		try {
			const response = await fetch(withBase('/api/blog/password'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ slug, password }),
				cache: 'no-store',
			})
			const data = await response.json()
			if (!response.ok) {
				setMessage(data.message || '密码错误，请重新输入！')
				return
			}
			window.location.reload()
		} catch {
			setMessage('获取文章时出错，请重试！')
		} finally {
			setPending(false)
		}
	}
	return (
		<form
			onSubmit={unlock}
			className='flex w-full flex-col items-center'
		>
			<label htmlFor='article-password'>
				本文需要密码才能查看，请输入密码~
			</label>
			<div className='mt-3 flex w-full justify-center'>
				<input
					id='article-password'
					type='password'
					autoComplete='current-password'
					required
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					className='max-w-[200px] rounded-l border border-slate-6 bg-slate-3 px-4 py-2 text-slate-12 sm:max-w-[300px] dark:bg-slatedark-3 dark:text-slatedark-12'
				/>
				<button
					type='submit'
					disabled={pending}
					className='rounded-r border border-slate-6 bg-blue-7 px-4 text-slate-12 disabled:opacity-50'
				>
					{pending ? '…' : '→'}
				</button>
			</div>
			<p
				role='status'
				aria-live='polite'
			>
				{message}
			</p>
		</form>
	)
}
