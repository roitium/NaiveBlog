interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'HFS NEXT',
    description: `A next generation front-end for haofenshu.com website built with React, Next.js and TypeScript.`,
    imgSrc: '/static/images/projects/hfs-next.jpeg',
    href: 'https://github.com/yanyao2333/hfs-next',
  },
  {
    title: 'BiliGPTHelper',
    description: `A Bilibili tool for summarizing videos using ChatGPT.`,
    imgSrc: '/static/images/projects/bili-gpt-helper.png',
    href: 'https://github.com/yanyao2333/BiliGPTHelper',
  },
]

export default projectsData
