---
name: content-reviewer
description: 审阅当前博客仓库中的文章内容与元信息，检查技术表达、结构、AI 腔、frontmatter、slug、系列与内链是否符合当前站点约定。适用于“帮我 review 这篇文章”“看看有没有 AI 味”“检查元信息和链接”等请求。
---

# Content Reviewer

## 审查重点

优先检查四类问题：

1. 内容问题：论点是否空泛、术语是否混乱、示例是否支撑结论
2. 元信息问题：frontmatter 是否完整，`series` / `seriesOrder` / `type` 是否合理
3. 路由问题：slug 是否稳定、标签或链接是否会导致无效路径
4. 文风问题：是否有明显 AI 腔、空洞总结、机械连接词堆积

## 本仓库特有检查项

- `description` 是否是一句可读摘要
- 系列文章是否显式写了 `series`
- 系列导读是否显式写了 `type: index`
- 正文内链是否仍然保留 `.md` / `.mdx` 相对路径
- 标签、slug 是否会生成不合法路由
- `tags` 是否遵守 `docs/tag-taxonomy.md`
- 是否误用了 `我不知道的` / `系列索引` 这类低价值标签
- 是否把本该进入 `keywords` 的一次性术语塞进了 `tags`
- 正文首个非空块是否仍然是 `# 一级标题`

## 审查输出

如果用户要 review，默认先给 findings，再给总结。

每条 finding 尽量包含：

- 问题位置
- 为什么这是问题
- 建议的修改方向

## 参考资料

如需更细的“去 AI 腔”检查，可读取：

- `references/anti-ai-patterns.md`
- `references/review-checklist.md`
