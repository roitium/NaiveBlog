import GiscusComponent from '@giscus/react'
import { useSyncExternalStore } from 'react'
import siteMetadata from '@/data/siteMetadata'

const subscribeToTheme = (onChange: () => void) => {
	const observer = new MutationObserver(onChange)
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['class'],
	})
	const colorScheme = matchMedia('(prefers-color-scheme: dark)')
	colorScheme.addEventListener('change', onChange)
	return () => {
		observer.disconnect()
		colorScheme.removeEventListener('change', onChange)
	}
}

const getTheme = () =>
	document.documentElement.classList.contains('dark') ? 'dark' : 'light'
const getServerTheme = () => (siteMetadata.theme === 'dark' ? 'dark' : 'light')

export default function Comments() {
	const configs = siteMetadata.comments?.giscusConfig
	const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme)
	if (!configs) {
		return null
	}
	const commentsTheme =
		configs.themeURL || (theme === 'dark' ? configs.darkTheme : configs.theme)

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
}
