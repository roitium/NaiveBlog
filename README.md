# Naive Blog

> Too young, too simple, sometimes naïve!
> —— 🐸

基于 Astro、React、Tailwind CSS 和 MDX 的个人博客。页面与公开正文在构建时生成 HTML，导航、搜索、目录、Memos 和文章内演示按需加载 React。密码文章等动态接口使用 Cloudflare Workers，OG 图片在构建时生成。

## 本地开发

推荐 Node.js 24，最低版本为 22.23.4；使用 pnpm 10。

```sh
pnpm install
cp .env.example .env
pnpm dev
```

开发服务器默认运行于 `http://localhost:4321`。

```sh
pnpm check     # Astro 与 TypeScript 检查
pnpm lint      # JS / TS / React 检查
pnpm build     # 同步文章并构建 Cloudflare Worker 与静态资源
pnpm serve     # 用 Wrangler / workerd 预览构建产物
pnpm test:smoke # 在 workerd 中运行临时文章、隐私隔离与接口回归测试
pnpm deploy:check # 对已构建的 Worker 执行部署 dry-run
pnpm deploy    # 构建并发布到 Cloudflare Workers
```

`test:smoke` 会清理测试文章与构建产物，测试后请重新运行 `pnpm build` 再部署。

不要并发运行 `check`、`build` 或多个开发服务器，它们共享 Astro 内容缓存。

## 文章与配置

站点信息位于 `data/siteMetadata.js`，分类显示名称与简介位于 `data/category-mapping.ts`。

- 文章存放于 `data/blog/**/*.{md,mdx}`，作者资料存放于 `data/authors/*.mdx`。
- 配置 `GIT_URL` 后，`dev` 和 `build` 会先拉取内容仓库的 `blog-posts/` 与 `static/images/`。未配置时使用本地内容。
- 目录层级决定分类，例如 `data/blog/programming/typescript.mdx` 对应 `/blog/programming/typescript` 与 `/categories/blog/programming`。
- 支持数学公式、代码高亮、代码标题、GitHub 提示块、引用与 MDX 自定义组件。
- `draft: true` 的文章仅在开发环境显示。`private: true` 的文章会显示在首页、文章列表、分类、标签和前后篇导航中，但不进入搜索、RSS 和文章 sitemap；访问正文需要输入密码。
- 密码正文仅在服务端验证成功后返回。不要将受保护正文或密码放进公开图片、前端组件 props 或公开变量。
- 加密文章通过 Worker 按需渲染，解锁后使用与公开文章相同的 Astro 原生 MDX 流程，支持相对图片和 Astro / React 组件。普通文章仍在构建时生成静态 HTML，文章 URL 不变。
- 解锁状态使用按文章签名的 HttpOnly、SameSite=Lax Cookie，HTTPS 下启用 Secure，最长有效 7 天；密码变更后失效。页面和鉴权接口均返回 `private, no-store`，不会把正文放入共享缓存。
- 可在构建密钥中配置 `PRIVATE_POST_COOKIE_SECRET`（至少 32 字节随机字符串）以跨部署保留解锁状态。不设置也可运行，但每次构建会生成新密钥，部署后需要重新输入文章密码。图片仍作为公开静态资源发布，不属于正文鉴权范围。

已有的 `<Image />`、`<TOCInline />` 和 `<GCPlay />` 由组件映射兼容。新增 React 交互组件时，在 MDX 中导入组件并使用 Astro 的 `client:load` 或 `client:visible` 指令，或建立 `.astro` 包装组件。公开 MDX 不再使用 `@content-collections/mdx/react` 编译产物。

`public/` 图片保留原有稳定 URL，并生成尺寸属性；React 组件使用原生 `<img>`。需要构建时图片优化的新增资源可放入 `src/`，使用 `astro:assets` 的 `Image`。

正文使用霞鹜文楷，仅在文章布局中通过 npm 包 `@chinese-fonts/lxgwwenkai` 引入 Regular（400）和 Medium（500）字重。文章标题、强调文本和加粗类使用 Medium；该版本没有独立的 Bold（700）字重。字体由构建工具打包到站点资源中，浏览器按 `unicode-range` 加载所需分包，无需在源码中维护字体文件或连接第三方字体 CDN。

## 私密文章仓库

文章仓库为 `https://github.com/roitium/blog-posts.git`，当前目录结构可直接使用。

1. 在 GitHub 创建 fine-grained Personal Access Token，Resource owner 选择 `roitium`，Repository access 仅选择 `blog-posts`，Repository permissions 设置 `Contents: Read-only`，并设置合适的有效期。
2. 本地开发将仓库 URL 与 Token 分别填入未提交的 `.env` 中的 `GIT_URL`、`GIT_TOKEN`。
3. 在 Cloudflare Workers Builds 的构建配置中添加 `GIT_URL=https://github.com/roitium/blog-posts.git`，并把 `GIT_TOKEN` 作为 **Build secret** 添加。它用于构建阶段，不是 Worker 运行时的 secret。
4. 重新触发构建。`pnpm build` 会先克隆文章仓库，再生成页面和静态 OG 图片。

脚本通过 Git 的环境配置注入 HTTPS Authorization header，Token 不放进仓库 URL、命令行参数或客户端变量。未配置 `GIT_TOKEN` 时仍可使用本地已配置的 Git 凭据。仅在文章仓库推送内容不会自动触发另一个仓库的 Workers Build，需要手动重建，或另行配置 Deploy Hook / CI 联动。

## 环境变量与部署

参考 `.env.example`。浏览器变量使用 `PUBLIC_*`；兼容已有部署中的 `NEXT_PUBLIC_*` 同名变量，显式配置的 `PUBLIC_*` 优先。私密变量不要使用这两个前缀。

部署使用 `@astrojs/cloudflare` 和 `wrangler.jsonc`。静态页面与资源输出到 `dist/client/`，服务端 Worker 输出到 `dist/server/`。Wrangler 自动读取构建生成的配置，静态资源由 `ASSETS` binding 提供，服务端接口由 Worker 执行。

```sh
pnpm build
pnpm serve --ip 127.0.0.1 --port 4321
pnpm deploy:check

# 首次部署时登录 Cloudflare；CI 可配置 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID。
pnpm exec wrangler login
pnpm deploy
```

`wrangler.jsonc` 中的 Worker 名称默认是 `naive-blog`，可按需修改。在 Cloudflare Workers Builds 中连接此仓库时，安装命令使用 `pnpm install --frozen-lockfile`，构建命令使用 `pnpm build`，部署命令使用 `pnpm exec wrangler deploy`。

`PUBLIC_*` 和兼容的 `NEXT_PUBLIC_*` 变量在构建时写入客户端代码，应配置在构建环境中；修改后需要重新构建。`GIT_URL` 同样仅用于构建阶段。未来新增的运行时密钥应通过 `wrangler secret put` 配置，不要放进公开前缀变量或提交到仓库。

已启用 `nodejs_compat`，密码接口可使用 Node crypto。项目没有使用 Astro Sessions，因此关闭了 session 支持，不会自动创建 KV namespace；图片使用构建时优化，也不要求 Cloudflare Images binding。静态资源的安全响应头位于 `public/_headers`，动态响应通过 Astro middleware 设置。

OG 图片在 Node 构建阶段为每篇文章生成到 `/og/<文章路径>.png`，文章的 Open Graph / Twitter 元数据直接引用静态图片。Worker 只分发 PNG，不再运行图片渲染器或加载 WASM。`@vercel/og` 仅作为构建依赖；Vercel 专属 Analytics / Speed Insights 已移除。更新文章标题或摘要后需要重新构建图片。

公开页面、`feed.xml`、`search.json`、`robots.txt` 和 `sitemap.xml` 静态生成。以下路由需要服务端运行时，不能直接部署到只提供静态文件的托管服务：

- `POST /api/blog/password`
- `GET /api/3party/netease/playlist`
- 历史链接重定向与未知路径的 404 回退

原有 `/archives/:id`、`/archive.html`、`/about.html`、`/github.html`、`/author/1`、`/page/:page` 和 `/cross.html/*` 链接保持永久重定向。

## 来源

最初基于 [timlrx/tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) 修改，现已迁移至 Astro。

设计参考：[Hayden Bleasel](https://www.haydenbleasel.com/)、[innei.in](https://innei.in/)、Typecho Handsome 主题与 Sakura 主题。
