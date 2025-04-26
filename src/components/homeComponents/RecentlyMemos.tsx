'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { Memo, MemoListResponse } from '@/types/memos'
import { formatToSemanticTime } from '@/utils/time'

async function fetchMemos() {
  if (!process.env.NEXT_PUBLIC_MEMOS_ENDPOINT) {
    return []
  }
  const apiEndpoint = process.env.NEXT_PUBLIC_MEMOS_ENDPOINT?.replace(/\/$/, '')
  const filter = `filter=creator=='users/1'`
  const pageSize = 'pageSize=5'
  const apiPath = 'api/v1/memos'
  const response = await fetch(
    `${apiEndpoint}/${apiPath}?${filter}&${pageSize}`,
  )
  const jsonResp: MemoListResponse = await response.json()
  return jsonResp.memos
}

export default function RecentlyMemos() {
  const [memos, setMemos] = useState<Memo[]>([])
  const [isBottom, setIsBottom] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef(null)

  // 监听滚动事件，判断是否到达底部
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      // 如果当前滚动位置接近底部，就设置isBottom为true
      setIsBottom(scrollTop + clientHeight >= scrollHeight - 20)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: 用于添加滚动事件监听，不需要依赖
  useEffect(() => {
    const ref = scrollRef.current
    if (ref) {
      // @ts-ignore
      ref.addEventListener('scroll', handleScroll, { passive: true })
    }
    return () => {
      if (ref) {
        // @ts-ignore
        ref.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    fetchMemos().then((data) => {
      if (!data) {
        toast.error('获取 memos 失败！')
        setIsLoading(false)
        return
      }
      setMemos(data)
      setIsLoading(false)
    })
  }, [])

  return (
    <div className='relative flex flex-col'>
      <h2 className='mb-4 font-medium text-lg'>💡 最近想法</h2>
      <div
        className='no-scrollbar relative max-h-[17.5rem] list-none overflow-scroll'
        ref={scrollRef}
      >
        {!isLoading ? (
          <ol className='relative ml-4 border-blue-7 border-s-[2px] dark:border-skydark-7'>
            <li className='h-2' />
            {memos.map((memo) => (
              <li
                key={memo.uid}
                className='ms-6 mb-10'
              >
                {/* 偏移 7px（半径加 border-s） */}
                <div className='-start-[7px] absolute mt-2 flex h-3 w-3 items-center justify-center rounded-full border-2 border-blue-7 bg-slate-2 dark:border-skydark-7 dark:bg-slatedark-2' />
                <div className='mr-2 flex flex-col justify-between rounded-lg bg-slate-3 p-4 shadow-xs ring-1 ring-slate-7/50 dark:bg-slatedark-3 dark:ring-slatedark-7/50'>
                  <time className='mb-2 self-start font-normal text-slate-11 text-xs dark:text-slatedark-11'>
                    {formatToSemanticTime(memo.createTime, navigator.language)}
                  </time>
                  <article className='prose prose-slate dark:prose-invert whitespace-pre-wrap font-normal text-sm'>
                    {memo.content}
                  </article>
                </div>
              </li>
            ))}
            <li className='ms-6 flex min-w-max justify-between'>
              <div />
              <Link
                href='/memory'
                className='min-w-max text-slate-12 text-sm hover:text-blue-11 dark:text-slatedark-12 dark:hover:text-skydark-11'
              >
                查看更多 &rarr;
              </Link>
            </li>
          </ol>
        ) : (
          <div className='flex min-h-[17.5rem] flex-col justify-center'>
            <div className='relative mx-auto flex size-6 justify-center self-center'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-9 opacity-75' />
              <span className='relative inline-flex size-6 rounded-full bg-blue-8' />
            </div>
            <span className='pt-6 text-center text-neutral-600 dark:text-neutral-400'>
              加载中...
            </span>
          </div>
        )}
      </div>
      {/* 向下箭头，接近底部时隐藏 */}
      {!isBottom && !isLoading && (
        <div className='-translate-x-1/2 absolute bottom-2 left-1/2 transform'>
          <div className='animate-bounce text-slate-11 text-sm dark:text-slatedark-11'>
            &darr;
          </div>
        </div>
      )}
    </div>
  )
}
