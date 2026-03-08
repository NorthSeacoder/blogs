---
name: blog-series-optimizer
description: 批量整理当前仓库中的整个博客系列，包括导入旧稿、补系列导读、校正 seriesOrder、修复链接和验证系列页展示。适用于“整批迁移一个系列”“修一整套系列文章”“补系列索引”等请求。这个 skill 主要用于兼容整系列操作；新写单篇时优先使用 blog-writer 或 blog-topic-advisor。
---

# Blog Series Optimizer

## 何时使用

- 迁移整个系列到当前仓库
- 一次性修复某个系列的 frontmatter、slug 和顺序
- 补做系列导读并验证 `/series/` 页面展示

## 推荐流程

1. 盘点该系列的所有文章与导读。
2. 确保系列里最多一个 `type: index` 导读。
3. 确保普通文章都有 `series`，并按需要补 `seriesOrder`。
4. 修复正文内链到 `/posts/{slug}/`。
5. 运行：
   - `npm run validate`
   - `npx -y node@20.19.0 node_modules/astro/astro.js build`

## 旧稿整批导入

如果任务来自旧草稿目录，优先执行：

`npm run import:drafts`

然后再对单个系列做精修，不要把导入脚本当成最终结果。

## 兼容说明

这个 skill 保留是为了兼容“整系列批处理”的工作流。
如果只是新增单篇或规划新系列，优先改用：

- `blog-topic-advisor`
- `blog-writer`
- `blog-optimizer`
