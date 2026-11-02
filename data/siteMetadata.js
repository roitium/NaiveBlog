/** @type {import("../src/types/siteMetadata").PlinyConfig } */
const siteMetadata = {
	title: 'Roitiumの自留地',
	author: 'Roitium',
	headerTitle: 'Roitiumの自留地',
	description: 'Be young & simple, even sometimes naive. ',
	language: 'zh-cn',
	theme: 'light', // system, dark or light
	siteUrl: 'https://www.roitium.com',
	siteRepo: 'https://github.com/roitium/blog-main',
	siteContentRepo: 'https://github.com/roitium/blog-posts',
	email: 'me@roitium.com',
	github: 'https://github.com/roitium',
	x: 'https://x.com/yoshino_2333',
	locale: 'zh-CN',
	stickyNav: false,
	comments: {
		provider: 'giscus',
		giscusConfig: {
			repo: import.meta.env.PUBLIC_GISCUS_REPO,
			repositoryId: import.meta.env.PUBLIC_GISCUS_REPOSITORY_ID,
			categories: import.meta.env.PUBLIC_GISCUS_CATEGORY,
			categoryId: import.meta.env.PUBLIC_GISCUS_CATEGORY_ID,
			mapping: 'pathname',
			reactions: '1',
			metadata: '0',
			theme: 'light',
			darkTheme: 'transparent_dark',
			themeURL: '',
			lang: 'zh-CN',
		},
	},
	search: {
		provider: 'kbar',
		kbarConfig: {
			searchDocumentsPath: `${import.meta.env.BASE_URL.replace(/\/$/, '')}/search.json`,
		},
	},
}

siteMetadata.siteLogo = `${siteMetadata.siteUrl}/static/images/logo.png`
siteMetadata.socialBanner = `${siteMetadata.siteUrl}/static/images/og.jpg`

export default siteMetadata
