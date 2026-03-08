---
name: blog-optimizer
description: 优化当前博客仓库里的既有文章，或把旧笔记/旧博客内容改造成符合当前站点 frontmatter、slug、系列规则和内链规则的正式文章。适用于“优化这篇博客”“迁移旧文”“补齐元信息”“修正文内链接”等请求。
---

# Blog Optimizer

## 适用场景

- 旧文章迁移到当前仓库
- 已有文章补齐 frontmatter
- 普通文章改成系列文章或系列导读
- 正文里的源码相对链接改成站内链接
- 清理不再使用的旧字段

## 元信息取舍

优先保留并映射这些字段：

- `date` → `pubDate`
- `last_optimized` → `updatedDate`
- `subtitle` → `subtitle`
- `topic` → `topic`
- `category` → `category`
- `tags` → `tags`
- `slug` → `slug`
- `model` → `model`
- `order` → `seriesOrder`
- `type: index` → `type: index`

默认不落站点 schema 的旧追溯字段：

- `optimized_from`
- `optimization_type`
- `style_version`
- `diagnosis`

## 工作流

1. 读取目标文件与 `src/content/config.ts`。
2. 判断是轻修、重写还是批量迁移。
3. 显式补齐 `series` / `seriesOrder` / `type`，不要依赖标题兜底。
4. 清理不被 schema 使用的旧字段。
5. 按 `docs/tag-taxonomy.md` 归并 `tags`，把一次性术语收回 `keywords`。
6. 如果正文首个非空块是 `# 一级标题`，移除它，避免与页面 Hero 重复。
7. 把正文相对链接改为 `/posts/{slug}/`。
8. 运行 `npm run validate`。
9. 需要时再跑 `astro build` 验证页面与路由。

## 批量迁移

如果用户要把旧草稿目录整体导入当前仓库，优先使用：

`npm run import:drafts`

导入后必须继续做两件事：

1. `npm run validate`
2. `npx -y node@20.19.0 node_modules/astro/astro.js build`

不要只执行导入，不做验证。
