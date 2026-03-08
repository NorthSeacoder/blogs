# Frontmatter 配置指南

本文档介绍如何在博客文章中正确配置 frontmatter，以及如何使用验证工具确保配置完整。

## 快速开始

### 1. 创建新文章

在 `src/content/blog/` 目录下创建 `.md` 或 `.mdx` 文件：

```markdown
---
title: 文章标题
description: 文章摘要，用于 SEO 和文章列表显示
pubDate: 2024-12-14
tags: ['Astro', 'Web Development']
cover: '../../assets/covers/my-cover.svg'
coverAlt: '封面图描述'
keywords: ['关键词1', '关键词2']
---

## 正文内容

这里是文章的正文...
```

### 2. 验证 Frontmatter

运行验证命令检查所有文章的 frontmatter 是否完整：

```bash
pnpm validate
```

## 字段说明

### 必填字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `title` | string | 文章标题 | `"使用 Astro 打造极快的博客"` |
| `description` | string | 文章摘要（10-160 字符） | `"介绍项目目标、性能与可访问性设计"` |
| `pubDate` | Date | 发布日期（YYYY-MM-DD） | `2024-12-01` |

### 推荐字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `tags` | string[] | 文章标签数组 | `['Astro', 'Performance']` |
| `keywords` | string[] | SEO 关键词（1-10 个） | `['Astro', 'Tailwind', '性能优化']` |
| `cover` | string | 封面图路径 | `'../../assets/covers/astro-cover.svg'` |
| `coverAlt` | string | 封面图 Alt 文本（无障碍） | `'Night gradient background with Astro text'` |

### 可选字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `updatedDate` | Date | 更新日期 | `2025-03-01` |
| `draft` | boolean | 是否为草稿（默认 false） | `true` |
| `canonical` | string | 规范链接（完整 URL） | `'https://example.com/posts/hello/'` |
| `lang` | string | 语言代码 | `'zh-CN'` |

## VSCode 自动补全

项目已配置 VSCode 自动补全支持，在编辑 Markdown 文件时：

1. 输入 frontmatter 字段名时会自动提示
2. 鼠标悬停在字段上会显示说明
3. 会提示必填字段和推荐字段

### 推荐安装的 VSCode 扩展

项目已在 `.vscode/extensions.json` 中配置推荐扩展：

- **Astro** (`astro-build.astro-vscode`) - Astro 语法支持
- **Prettier** (`esbenp.prettier-vscode`) - 代码格式化
- **ESLint** (`dbaeumer.vscode-eslint`) - 代码检查
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - Tailwind 类名提示
- **MDX** (`unifiedjs.vscode-mdx`) - MDX 语法支持
- **YAML** (`redhat.vscode-yaml`) - YAML 语法支持（frontmatter）

首次打开项目时，VSCode 会提示安装这些扩展。

## 验证工具使用

### 基本验证

```bash
# 验证所有文章的 frontmatter
pnpm validate
```

输出示例：

```
🔍 开始验证博客文章 frontmatter...

📄 hello-astro.md
   ✅ Frontmatter 完整且符合规范

📄 my-post.md
   ⚠️  建议添加字段: tags, keywords, cover, coverAlt

📄 draft-post.md
   ❌ 缺少必填字段: description
   ⚠️  有 cover 但缺少 coverAlt（无障碍访问）

============================================================
📊 验证完成: 共 3 个文件
   ✅ 通过: 1
   ⚠️  警告: 1
   ❌ 错误: 1
============================================================
```

### 监听模式（开发时使用）

```bash
# 监听文件变化，自动重新验证
pnpm validate:watch
```

### 集成到 Git Hooks

可以在 `package.json` 中添加 pre-commit hook：

```json
{
  "scripts": {
    "precommit": "pnpm validate && pnpm lint"
  }
}
```

或使用 `husky` + `lint-staged`：

```bash
pnpm add -D husky lint-staged
```

## 常见问题

### Q: 为什么需要 coverAlt？

A: `coverAlt` 是封面图的替代文本，用于：
- 屏幕阅读器（无障碍访问）
- 图片加载失败时的替代显示
- SEO 优化

如果设置了 `cover`，强烈建议同时设置 `coverAlt`。

### Q: tags 和 keywords 有什么区别？

A:
- `tags`：用于文章分类和标签页展示，对用户可见
- `keywords`：用于 SEO 优化，添加到 `<meta name="keywords">` 标签中

### Q: 如何隐藏草稿文章？

A: 设置 `draft: true`，文章将不会出现在文章列表和搜索结果中：

```yaml
---
title: 草稿文章
description: 这是一篇草稿
pubDate: 2024-12-14
draft: true
---
```

### Q: 日期格式必须是 YYYY-MM-DD 吗？

A: 是的，必须使用 ISO 8601 格式（YYYY-MM-DD），例如：
- ✅ `2024-12-14`
- ❌ `12/14/2024`
- ❌ `2024-12-14T10:00:00Z`

### Q: 可以添加自定义字段吗？

A: 不建议。项目使用严格的 schema 验证（`additionalProperties: false`），自定义字段会导致验证失败。

如需添加新字段，请：
1. 修改 `src/content/config.ts` 中的 schema
2. 更新 `.vscode/frontmatter-schema.json`
3. 更新 `scripts/validate-frontmatter.ts`

## 最佳实践

### 1. 标题和描述

```yaml
# ✅ 好的标题：简洁、描述性强
title: 为中文优化 Pagefind 站内搜索

# ❌ 不好的标题：过长、不清晰
title: 如何在 Astro 博客中集成 Pagefind 并启用 extended 二进制以支持中文检索的完整指南

# ✅ 好的描述：10-160 字符，包含关键信息
description: 讲解如何在 Astro 博客中集成 Pagefind，启用 extended 二进制以支持中文检索。

# ❌ 不好的描述：过短或过长
description: Pagefind 教程
```

### 2. 标签使用

```yaml
# ✅ 使用 2-5 个相关标签
tags: ['Astro', 'Search', 'Pagefind']

# ❌ 标签过多或过少
tags: ['Astro', 'Search', 'Pagefind', 'JavaScript', 'TypeScript', 'Web', 'Frontend', 'Performance']
tags: []
```

### 3. 关键词优化

```yaml
# ✅ 使用 3-8 个相关关键词
keywords: ['Pagefind', '中文分词', 'Astro 搜索', '静态站点搜索']

# ❌ 关键词堆砌
keywords: ['Pagefind', 'search', '搜索', 'Astro', 'astro', 'ASTRO', '中文', 'Chinese']
```

### 4. 封面图

```yaml
# ✅ 使用相对路径 + Alt 文本
cover: '../../assets/covers/astro-cover.svg'
coverAlt: 'Night gradient background with Astro text'

# ✅ 使用公共目录路径
cover: '/images/covers/my-post.jpg'
coverAlt: 'A beautiful sunset over the mountains'

# ❌ 缺少 Alt 文本
cover: '../../assets/covers/astro-cover.svg'
# coverAlt 未设置
```

## 示例模板

### 基础文章模板

```markdown
---
title: 文章标题
description: 文章摘要（10-160 字符）
pubDate: 2024-12-14
tags: ['标签1', '标签2']
keywords: ['关键词1', '关键词2', '关键词3']
---

## 正文内容

这里是文章的正文...
```

### 完整文章模板

```markdown
---
title: 文章标题
description: 文章摘要（10-160 字符）
pubDate: 2024-12-14
updatedDate: 2024-12-15
tags: ['标签1', '标签2', '标签3']
cover: '../../assets/covers/my-cover.svg'
coverAlt: '封面图的详细描述'
canonical: https://example.com/posts/my-post/
lang: zh-CN
keywords: ['关键词1', '关键词2', '关键词3']
draft: false
---

## 正文内容

这里是文章的正文...
```

## 相关文档

- [Astro Content Collections 文档](https://docs.astro.build/en/guides/content-collections/)
- [Zod Schema 文档](https://zod.dev/)
- [项目 CLAUDE.md](../CLAUDE.md) - 完整的项目架构文档
