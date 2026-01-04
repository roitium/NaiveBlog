import remarkMediaCard from '@zhouhua-dev/remark-media-card'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { toast } from 'sonner'
import { unified } from 'unified'
import { remarkTagToJsx } from '@/mdx-plugins/remark-tag-to-jsx'
import type { ApiMemo, ApiResponse, TimelineResponse } from '@/types/memos'

export async function fetchComments(memoName: string) {
	const response = await fetch(
		`https://nodal.roitium.com/api/v1/memos/${memoName}`,
	)
	const jsonResp: ApiResponse<ApiMemo> = await response.json()
	if (jsonResp.data === null) {
		toast.error('获取评论失败')
		return []
	}
	const comments = jsonResp.data.replies

	// 处理评论内容
	return await Promise.all(
		comments.map(async (comment) => {
			comment.content = await unified()
				.use(remarkParse)
				.use(remarkGfm)
				.use(remarkTagToJsx)
				.use(remarkRehype, { allowDangerousHtml: true })
				// .use(rehypeSanitize)
				.use(rehypeStringify, { allowDangerousHtml: true })
				.process(comment.content)
				.then((file) => file.toString())
			return comment
		}),
	)
}

/**
 * 获取Memos列表
 * @returns Memos列表
 */
export async function fetchMemos() {
	const response = await fetch(
		`https://nodal.roitium.com/api/v1/memos/timeline?limit=20&username=roitium`, // 前端掩耳盗铃行为，有点难绷了
	)
	if (!response.ok) {
		toast.error('获取 memos 时发生错误！')
		return false
	}
	const jsonResp: ApiResponse<TimelineResponse> = await response.json()
	if (jsonResp.data === null) {
		toast.error('获取 memos 时发生错误！')
		return false
	}
	// 处理Memos内容
	return await Promise.all(
		jsonResp.data.data.map(async (memo: ApiMemo) => {
			memo.content = await unified()
				.use(remarkParse)
				.use(remarkMediaCard)
				.use(remarkGfm)
				.use(remarkTagToJsx)
				.use(remarkRehype, { allowDangerousHtml: true })
				// .use(rehypeSanitize)
				.use(rehypeStringify, { allowDangerousHtml: true })
				.process(memo.content)
				.then((file) => file.toString())
			return memo
		}),
	)
}
