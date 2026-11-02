import type { Post } from './core'

const isProduction = import.meta.env.PROD
/**
 *  在生产环境下，过滤掉草稿和隐私文章
 *  防止未完成或私有的内容在生产环境被公开
 * @param {Post[]} allBlogs
 * @returns {Post[]}
 */
export function filterVisiablePosts<T extends Post>(allBlogs: T[]): T[] {
	if (isProduction) {
		return allBlogs.filter((blog) => !(blog.draft || blog.private))
	}
	return allBlogs
}

/**
 *  日期降序排序的辅助函数
 *  用于比较两个日期的大小，以便按时间倒序排列
 * @param {Date} a
 * @param {Date} b
 * @returns {number}
 */
export function dateSortDesc(a: Date, b: Date) {
	if (a > b) return -1
	if (a < b) return 1
	return 0
}

/**
 *  按日期排序文章，可选择将置顶文章放在前面
 *  允许用户将置顶文章排在前面，同时保证所有文章按时间倒序排列
 * @param {T[]} allBlogs
 * @param {boolean} [putPinnedFirst=true]
 * @returns {T[]}
 */
export function sortPostsByDate<T extends CoreContent<Post> | Post>(
	allBlogs: T[],
	putPinnedFirst = true,
): T[] {
	if (putPinnedFirst) {
		const pinnedPosts = allBlogs.filter((blog) => blog.pinned)
		const unpinnedPosts = allBlogs.filter((blog) => !blog.pinned)

		pinnedPosts.sort((a, b) => dateSortDesc(a.date, b.date))
		unpinnedPosts.sort((a, b) => dateSortDesc(a.date, b.date))
		return [...pinnedPosts, ...unpinnedPosts]
	}
	return allBlogs.sort((a, b) => dateSortDesc(a.date, b.date))
}

export type CoreContent<T> = Omit<T, 'password' | 'content' | '_id' | 'toc'>

/**
 * 从 MDX 文档中删除密码、toc、原始内容和 _id，只返回核心内容
 *  暴露给用户的数据应该只包含核心信息，避免暴露不必要的数据
 * @param {T} content
 * @return {*}  {CoreContent<T>}
 */
export function coreContent<T extends Post>(content: T): CoreContent<T> {
	return omit(content, ['password', 'content', '_id', 'toc'])
}

/**
 *  类型安全的 omit 辅助函数
 *  提供一个类型安全的 omit 方法，方便从对象中删除指定的 key
 * @example omit(content, ['mdx', 'content', '_id'])
 *
 * @param {Obj} obj
 * @param {Keys[]} keys
 * @return {*}  {Omit<Obj, Keys>}
 */
export const omit = <Obj, Keys extends keyof Obj>(
	obj: Obj,
	keys: Keys[],
): Omit<Obj, Keys> => {
	const result = Object.assign({}, obj)
	for (const key of keys) {
		delete result[key]
	}
	return result
}

/**
 * 从 MDX 文档列表中删除 password, content, _id, toc，只返回核心内容
 * 如果 `NODE_ENV` === "production"，还会过滤掉草稿和私密文章
 *  确保用户只能访问到需要的核心数据，并且在生产环境下不会包含草稿内容
 * @param {T[]} contents
 * @return {*}  {CoreContent<T>[]}
 */
export function allCoreContent<T extends Post>(
	contents: T[],
): CoreContent<T>[] {
	return filterVisiablePosts(contents).map((content) => coreContent(content))
}
