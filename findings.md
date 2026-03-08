# Findings

## Current Blog

- `src/content/config.ts` 当前只支持基础文章字段和 `series` / `seriesOrder`。
- `src/pages/series/index.astro` 与 `src/pages/series/[series]/index.astro` 都是从 `blog` 集合动态聚合，没有独立系列数据源。
- 当前系列识别优先读 `post.data.series`，没有时退回标题正则。
- 详情页和列表页都使用 `post.slug` 跳转，路由文件是 `src/pages/posts/[slug].astro`。

## Source Drafts

- 草稿目录包含多个系列目录，常见文件模式是 `XX-00-系列索引.mdx` + `XX-01...mdx`。
- `_progress.md` 看起来是写作进度文件，不应迁移到站点内容集合。
- 常见 frontmatter 字段包括：`title`、`topic`、`subtitle`、`order`、`date`、`last_optimized`、`tags`、`category`、`slug`、`model`、`optimized_from`、`optimization_type`、`style_version`、`diagnosis`、`type`。
- 系列索引文件通常带 `type: index`。
- 正文中存在大量指向其他 `.mdx` 文件的相对链接，需要在迁移时改写为站内文章 URL。
- 至少有一个文件的 frontmatter 非法：`tags: [CSS, 选择器, 优先级, 层叠, @layer, 我不知道的]` 中 `@layer` 未加引号，导致 YAML 解析失败。
- 源稿正文里还有不少非代码区域的尖括号文本，例如 `<50KB>`、`<1>`、`<empty>`，在 MDX 中会被误判为 JSX，需要在迁移时统一转义。
- 标签中存在 `/`，例如 `HTTP/2`、`HTTP/3`、`async/await`，原始值不能直接作为 `[tag]` 动态路由参数。
