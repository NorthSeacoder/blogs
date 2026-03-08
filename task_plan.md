# Task Plan

## Goal

将 `/Users/yqg/learning/biji/note/04-副业/博客/草稿` 下的系列博客迁移到当前 Astro 博客，统一并扩展 frontmatter，确保系列索引可展示，同时把博客相关 skills 收拢到项目内的单源多链结构，供 Codex / Claude Code / Cursor 共用。

## Phases

| Phase | Status | Notes |
|---|---|---|
| 1. 现状扫描与规则确认 | completed | 已确认当前博客 schema、series 页面逻辑、草稿目录存在系列索引和普通文章两种形态 |
| 2. 设计迁移字段与目标结构 | completed | 已明确保留字段、slug 规则、系列索引识别方式与链接改写策略 |
| 3. 实现迁移脚本并导入内容 | completed | 已处理非法 YAML、slug、内部链接、系列索引文章，并导入 87 篇 MDX |
| 4. 调整站点 schema / 页面展示 | completed | 系列页和文章页已识别系列索引，普通列表页已排除系列索引 |
| 5. 创建并链接 blog skills | completed | `.agents/skills` 为源，`.cursor/skills` / `.claude/skills` / `.codex/skills` 已建立相对软链接 |
| 6. 验证与收尾 | completed | 已完成 `pnpm validate` 与 `pnpm build`（Node 20 环境） |

## Decisions

- 优先使用显式 frontmatter，而不是依赖标题正则解析系列。
- `optimized_from` / `optimization_type` / `style_version` / `diagnosis` 倾向不进入站点 schema，除非仅作为迁移脚本的忽略字段。
- `date`、`last_optimized`、`model`、`tags`、`category`、`slug`、`topic`、`order` 都需要被评估并尽量映射到现有站点字段。
- 系列索引文件应作为正常文章迁移，但需要额外字段让系列页能把它识别为“系列导读”。

## Risks

- 源文件正文里存在大量相对 `.mdx` 链接，直接迁移会失效。
- 源文件 frontmatter 至少有一部分是非法 YAML，需要容错解析与修复。
- 当前博客动态路由是 `[slug]`，不能接受带 `/` 的多级 slug。
- 当前工作区已有大量用户生成的 `.astro` / `dist` / `node_modules` 变更，不能误回滚。
- 本机默认 `node` 为 `18.17.1`，低于 Astro 当前构建要求，需要切换到 Node `20.19.0` 才能完整验证。
