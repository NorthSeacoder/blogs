#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';
import {
  FORBIDDEN_TAGS,
  STRATEGIC_TAGS,
  TAG_ALIASES,
  TAG_POLICY_DOC,
  cleanTagList,
  getTagLimit,
} from './tag-taxonomy.mjs';

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  subtitle: z.string().optional(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional(),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  canonical: z.string().url().optional(),
  lang: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  topic: z.string().optional(),
  category: z.string().optional(),
  model: z.string().optional(),
  type: z.enum(['post', 'index']).optional(),
  series: z.string().optional(),
  seriesOrder: z.number().int().nonnegative().optional(),
});

const requiredFields = ['title', 'description', 'pubDate'];
const recommendedFields = ['tags', 'keywords'];

function collectMarkdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return collectMarkdownFiles(fullPath);
    }

    return entry.name.endsWith('.md') || entry.name.endsWith('.mdx') ? [fullPath] : [];
  });
}

function buildGlobalTagCounts(files) {
  const counts = new Map();

  files.forEach((filePath) => {
    const { data } = matter(fs.readFileSync(filePath, 'utf8'));
    cleanTagList(data.tags).forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return counts;
}

function validateFile(filePath, globalTagCounts) {
  const result = {
    file: filePath,
    status: 'valid',
    messages: [],
  };

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);

    const missingRequired = requiredFields.filter((field) => !(field in data));
    if (missingRequired.length > 0) {
      result.status = 'error';
      result.messages.push(`❌ 缺少必填字段: ${missingRequired.join(', ')}`);
    }

    const missingRecommended = recommendedFields.filter((field) => !(field in data));
    if (missingRecommended.length > 0) {
      if (result.status === 'valid') {
        result.status = 'warning';
      }
      result.messages.push(`⚠️  建议添加字段: ${missingRecommended.join(', ')}`);
    }

    try {
      blogSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.status = 'error';
        error.errors.forEach((err) => {
          result.messages.push(`❌ ${err.path.join('.')}: ${err.message}`);
        });
      }
    }

    if (data.tags && Array.isArray(data.tags) && data.tags.length === 0) {
      if (result.status === 'valid') {
        result.status = 'warning';
      }
      result.messages.push('⚠️  tags 数组为空，建议添加至少一个标签');
    }

    if (data.cover && !data.coverAlt) {
      if (result.status === 'valid') {
        result.status = 'warning';
      }
      result.messages.push('⚠️  有 cover 但缺少 coverAlt（无障碍访问）');
    }

    if (Array.isArray(data.tags)) {
      const duplicateTags = data.tags.filter((tag, index) => data.tags.indexOf(tag) !== index);
      if (duplicateTags.length > 0) {
        if (result.status === 'valid') {
          result.status = 'warning';
        }
        result.messages.push(`⚠️  存在重复标签: ${[...new Set(duplicateTags)].join(', ')}`);
      }

      const limit = getTagLimit(data.type);
      if (data.tags.length > limit) {
        if (result.status === 'valid') {
          result.status = 'warning';
        }
        result.messages.push(`⚠️  标签数量过多：当前 ${data.tags.length}，建议最多 ${limit} 个`);
      }

      const forbiddenTags = data.tags.filter((tag) => FORBIDDEN_TAGS.has(tag));
      if (forbiddenTags.length > 0) {
        if (result.status === 'valid') {
          result.status = 'warning';
        }
        result.messages.push(`⚠️  包含已禁用标签: ${forbiddenTags.join(', ')}`);
      }

      const legacyTags = data.tags
        .filter((tag) => TAG_ALIASES.has(tag))
        .map((tag) => `${tag} -> ${TAG_ALIASES.get(tag)}`);
      if (legacyTags.length > 0) {
        if (result.status === 'valid') {
          result.status = 'warning';
        }
        result.messages.push(`⚠️  建议使用规范标签: ${legacyTags.join(', ')}`);
      }

      const singletonTags = cleanTagList(data.tags).filter((tag) => {
        if (STRATEGIC_TAGS.has(tag)) return false;
        return (globalTagCounts.get(tag) ?? 0) <= 1;
      });
      if (singletonTags.length > 0) {
        if (result.status === 'valid') {
          result.status = 'warning';
        }
        result.messages.push(
          `⚠️  这些标签目前只出现在一篇文章里，建议改放 keywords: ${singletonTags.join(', ')}`,
        );
      }
    }

    const { content: body } = matter(content);
    const firstNonEmptyLine = body.split('\n').find((line) => line.trim() !== '');
    if (firstNonEmptyLine && /^#\s+/.test(firstNonEmptyLine)) {
      if (result.status === 'valid') {
        result.status = 'warning';
      }
      result.messages.push('⚠️  正文首个非空行是一级标题；文章页已单独渲染标题，建议移除这个 H1');
    }

    if (result.status === 'valid') {
      result.messages.push('✅ Frontmatter 完整且符合规范');
    }
  } catch (error) {
    result.status = 'error';
    result.messages.push(
      `❌ 文件读取失败: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return result;
}
function main() {
  console.log('🔍 开始验证博客文章 frontmatter...\n');

  const contentDir = path.join(process.cwd(), 'src/content/blog');

  if (!fs.existsSync(contentDir)) {
    console.error('❌ 找不到内容目录: src/content/blog');
    process.exit(1);
  }

  const files = collectMarkdownFiles(contentDir);
  const globalTagCounts = buildGlobalTagCounts(files);

  if (files.length === 0) {
    console.log('⚠️  没有找到任何 Markdown 文件');
    process.exit(0);
  }

  const results = files.map((filePath) => validateFile(filePath, globalTagCounts));
  let hasErrors = false;
  let hasWarnings = false;

  results.forEach((result) => {
    console.log(`\n📄 ${path.relative(contentDir, result.file)}`);
    result.messages.forEach((msg) => console.log(`   ${msg}`));

    if (result.status === 'error') hasErrors = true;
    if (result.status === 'warning') hasWarnings = true;
  });

  console.log('\n' + '='.repeat(60));
  console.log(`📊 验证完成: 共 ${files.length} 个文件`);
  console.log(`   ✅ 通过: ${results.filter((r) => r.status === 'valid').length}`);
  console.log(`   ⚠️  警告: ${results.filter((r) => r.status === 'warning').length}`);
  console.log(`   ❌ 错误: ${results.filter((r) => r.status === 'error').length}`);
  console.log('='.repeat(60) + '\n');

  console.log('📋 可用的 frontmatter 字段：\n');
  console.log('必填字段：');
  console.log('  - title: string          # 文章标题');
  console.log('  - description: string    # 文章摘要');
  console.log('  - pubDate: Date          # 发布日期（格式：YYYY-MM-DD）\n');

  console.log('可选字段：');
  console.log('  - subtitle: string       # 副标题');
  console.log('  - updatedDate: Date      # 更新日期');
  console.log('  - tags: string[]         # 标签数组');
  console.log('  - draft: boolean         # 是否为草稿（默认 false）');
  console.log('  - cover: string          # 封面图路径');
  console.log('  - coverAlt: string       # 封面图 Alt 文本');
  console.log('  - canonical: string      # 规范链接（完整 URL）');
  console.log('  - lang: string           # 语言代码（如 zh-CN）');
  console.log('  - keywords: string[]     # SEO 关键词');
  console.log('  - topic: string          # 主题名');
  console.log('  - category: string       # 分类');
  console.log('  - model: string          # 生成/优化时使用的模型');
  console.log('  - type: post | index     # 普通文章或系列导读');
  console.log('  - series: string         # 系列名');
  console.log('  - seriesOrder: number    # 系列内顺序\n');
  console.log(`标签约束说明：${TAG_POLICY_DOC}\n`);

  if (hasErrors) {
    console.error('❌ 验证失败：存在错误，请修复后重试');
    process.exit(1);
  }

  if (hasWarnings) {
    console.log('⚠️  验证通过但有警告，建议完善 frontmatter');
    process.exit(0);
  }

  console.log('✅ 所有文件验证通过！');
}

main();
