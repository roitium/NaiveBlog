interface CoreConfig {
	title: string
	author: string
	description: string
	language: string
	/** light and dark */
	theme: 'system' | 'dark' | 'light'
	siteUrl: string
	siteContentRepo: string
	socialBanner: string
	email: string
	github: string
	x?: string
	twitter?: string
	locale: string
}
type SiteConfig = CoreConfig & {
	comments?: {
		provider: 'giscus'
		giscusConfig?: {
			repo: string
			repositoryId: string
			categories: string
			categoryId: string
			mapping: 'pathname' | 'url' | 'title'
			reactions: '1' | '0'
			metadata: '1' | '0'
			theme: 'light' | 'dark' | 'preferred_color_scheme'
			darkTheme: string
			themeURL?: string
			lang: string
		}
	}
}

export type { CoreConfig, SiteConfig }
