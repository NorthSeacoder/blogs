#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { TAG_POLICY_DOC, STRATEGIC_TAGS, cleanTagList, getTagLimit } from './tag-taxonomy.mjs';

const contentDir = path.join(process.cwd(), 'src/content/blog');

function collectMarkdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectMarkdownFiles(fullPath);
    }
    return entry.name.endsWith('.md') || entry.name.endsWith('.mdx') ? [fullPath] : [];
  });
}

function buildTagCounts(files) {
  const counts = new Map();
  files.forEach((filePath) => {
    const { data } = matter(fs.readFileSync(filePath, 'utf8'));
    cleanTagList(data.tags).forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });
  return counts;
}

function rankTags(tags, counts) {
  return [...tags].sort((a, b) => {
    const left = STRATEGIC_TAGS.has(a) ? Number.MAX_SAFE_INTEGER : (counts.get(a) ?? 0);
    const right = STRATEGIC_TAGS.has(b) ? Number.MAX_SAFE_INTEGER : (counts.get(b) ?? 0);
    return right - left || a.localeCompare(b, 'zh-CN');
  });
}

function normalizeFrontmatterTags(files) {
  const initialCounts = buildTagCounts(files);

  const firstPass = new Map();
  files.forEach((filePath) => {
    const { data } = matter(fs.readFileSync(filePath, 'utf8'));
    const nextTags = rankTags(
      cleanTagList(data.tags).filter(
        (tag) => STRATEGIC_TAGS.has(tag) || (initialCounts.get(tag) ?? 0) >= 2,
      ),
      initialCounts,
    ).slice(0, getTagLimit(data.type));

    firstPass.set(filePath, nextTags);
  });

  const firstPassCounts = new Map();
  firstPass.forEach((tags) => {
    tags.forEach((tag) => {
      firstPassCounts.set(tag, (firstPassCounts.get(tag) ?? 0) + 1);
    });
  });

  files.forEach((filePath) => {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(raw);
    const nextTags = rankTags(
      (firstPass.get(filePath) ?? []).filter(
        (tag) => STRATEGIC_TAGS.has(tag) || (firstPassCounts.get(tag) ?? 0) >= 2,
      ),
      firstPassCounts,
    );

    parsed.data.tags = nextTags;
    fs.writeFileSync(filePath, matter.stringify(parsed.content, parsed.data));
  });
}

function main() {
  if (!fs.existsSync(contentDir)) {
    console.error('❌ 找不到内容目录: src/content/blog');
    process.exit(1);
  }

  const files = collectMarkdownFiles(contentDir);
  if (files.length === 0) {
    console.log('⚠️  没有找到任何 Markdown 文件');
    return;
  }

  normalizeFrontmatterTags(files);
  console.log(`✅ 已规范化 ${files.length} 个内容文件的 tags`);
  console.log(`ℹ️  规则来源：${TAG_POLICY_DOC}`);
}

main();
