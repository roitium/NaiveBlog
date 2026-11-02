'use client'
import GiscusComponent from '@giscus/react'
import { ThemeProvider, useTheme } from 'next-themes'
import { memo } from 'react'
import siteMetadata from '@/data/siteMetadata'

const Giscus = memo(() => {
	const configs = siteMetadata.comments?.giscusConfig
	const { theme: nextTheme, resolvedTheme } = useTheme()
	if (!configs) {
		return null
	}
	const commentsTheme =
		configs?.themeURL === ''
			? nextTheme === 'dark' || resolvedTheme === 'dark'
				? configs.darkTheme
				: configs.theme
			: configs?.themeURL

	const COMMENTS_ID = 'comments-container'

	return (
		<GiscusComponent
			id={COMMENTS_ID}
			// @ts-expect-error 我们只限制了为 string
			repo={configs?.repo}
			repoId={configs?.repositoryId}
			category={configs?.categories}
			categoryId={configs?.categoryId}
			mapping={configs?.mapping}
			reactionsEnabled={configs?.reactions}
			emitMetadata={configs?.metadata}
			inputPosition={'bottom'}
			theme={commentsTheme}
			lang={configs?.lang}
			loading='lazy'
		/>
	)
})

Giscus.displayName = 'Giscus'

export default function Comments() {
	return (
		<ThemeProvider
			attribute='class'
			defaultTheme={siteMetadata.theme}
			enableSystem
		>
			<Giscus />
		</ThemeProvider>
	)
}
