---
name: blog-topic-advisor
description: 为当前博客规划新选题、新系列和系列导读。适用于“这个主题还能写什么”“帮我规划一个系列”“避免和现有文章重复”“给我一组 title/slug/seriesOrder 建议”等请求。
---

# Blog Topic Advisor

## 目标

输出适配当前仓库的选题方案，而不是抽象 brainstorm。

每个建议至少应包含：

- `title`
- `slug`
- `series`
- `seriesOrder`（如果是系列文章）
- 一句话说明这篇解决什么误解

## 先做什么

开始前先检查仓库里是否已有相近内容：

1. 搜索 `src/content/blog/` 中相关 `title`
2. 搜索相关 `topic` / `category` / `tags`
3. 读取 `docs/tag-taxonomy.md`，优先沿用已有标签体系
4. 查看对应系列是否已经有导读和编号

## 输出格式建议

### 新系列

给出：

- 系列名
- 系列导读标题与 slug
- 5 到 10 篇候选文章
- 每篇的 `seriesOrder`
- 推荐阅读顺序

### 补系列

给出：

- 当前缺口
- 建议插入的位置
- 新文章的 `seriesOrder`
- 需要同步调整的相邻文章

## 约束

- 不要提议带 `/` 的 slug
- 不要重复已有系列里的同类主题
- 系列导读应使用 `type: index`
- 选题建议要能落到当前仓库结构，不要引用旧笔记仓的目录约定
- 给标签建议时，优先推荐可复用标签；一次性概念词优先放 `keywords`
