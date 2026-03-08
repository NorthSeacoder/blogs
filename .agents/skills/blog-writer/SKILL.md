---
name: blog-writer
description: 为当前 Astro 博客撰写新文章、续写草稿、创建系列导读，或把已有笔记整理成符合 src/content/blog 约定的正式内容。适用于“写一篇博客”“补一篇系列文章”“生成 frontmatter 和 slug”“创建系列索引”等请求。
---

# Blog Writer

## 目标

产出可直接放入 `src/content/blog/` 的 `.md` 或 `.mdx` 文章，并确保：

- frontmatter 符合 `src/content/config.ts`
- slug 是单段、稳定、ASCII 友好的路径片段
- 系列文章显式声明 `series` 和 `seriesOrder`
- 系列导读显式声明 `type: index`
- 正文内链使用站内路径：`/posts/{slug}/`

## 最小读取范围

开始前优先读取这些文件：

1. `src/content/config.ts`
2. 同主题或同系列的现有文章
3. `src/pages/series/index.astro` 和 `src/pages/series/[series]/index.astro`，仅在需要确认系列展示逻辑时读取

不要无差别扫描整个内容目录，只读取当前选题附近的文件。

## 写作约定

### 1. frontmatter

必填：

- `title`
- `description`
- `pubDate`

常用可选：

- `subtitle`
- `updatedDate`
- `tags`
- `keywords`
- `topic`
- `category`
- `model`
- `type`
- `series`
- `seriesOrder`
- `slug`

### 2. 系列规则

- 普通系列文章：必须写 `series`，最好写 `seriesOrder`
- 系列导读：写 `type: index`，写 `series`，不要依赖标题正则推断
- 同一系列内，`seriesOrder` 应连续且可读

### 3. slug 规则

- 用小写英文和连字符
- 不要包含 `/`
- 新文章先检查 `src/content/blog/` 是否已有同名 slug

### 4. 链接规则

- 站内文章统一链接到 `/posts/{slug}/`
- 不要保留 `./foo.mdx` 或 `../bar/baz.mdx` 这种源码相对路径

## 推荐流程

1. 先确认这是独立文章、系列文章，还是系列导读。
2. 读取相邻文章，避免重复论点和重复示例。
3. 先定标题、slug、series、seriesOrder，再写正文。
4. 写完后运行 `npm run validate`。
5. 需要验证站点渲染时，优先用：
   `npx -y node@20.19.0 node_modules/astro/astro.js build`

## 风格要求

- 直接、具体，少空话
- 优先讲“为什么”和“什么时候会踩坑”
- 代码示例要服务于论点，不要堆数量
- `description` 保持一句话摘要，不要写成导语段落
