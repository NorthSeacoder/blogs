---
title: 使用 Astro 打造极快的博客
description: 介绍项目目标、性能与可访问性设计，展示 Astro + Tailwind 的基础搭建。
pubDate: 2024-12-01
tags: ['Astro', 'Performance']
cover: '../../assets/covers/astro-cover.svg'
coverAlt: 'Night gradient background with Astro text'
keywords: ['Astro', 'Tailwind', '性能优化']
---

欢迎来到新的博客项目！我们选择 **Astro 5** 搭配 **Tailwind CSS v4**，通过岛屿架构实现极低的客户端负载，并让样式保持原子化。

## 设计要点

- 首页、文章页和搜索页全部走静态输出，方便部署到任何 CDN。
- 内容存储在 `src/content/blog`，通过 Content Collections 提供类型安全。
- 通过 `remark-gfm` 和 `rehype-autolink-headings` 支持表格、脚注和标题锚点。

## 下一步

1. 添加更多文章元信息（标签、更新时间）。
2. 配置 Pagefind 构建站内索引。
3. 使用 Astro Image 对封面进行多尺寸输出，提升 LCP。
