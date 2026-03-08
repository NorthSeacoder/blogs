#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const SOURCE_DIR = '/Users/yqg/learning/biji/note/04-副业/博客/草稿';
const TARGET_DIR = path.join(process.cwd(), 'src/content/blog');

function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Source directory not found: ${SOURCE_DIR}`);
  }

  const files = collectMdxFiles(SOURCE_DIR).map(readSourceFile);
  const slugBySourcePath = buildSlugMap(files);
  const slugByBasename = buildBasenameSlugMap(files, slugBySourcePath);
  const seriesRouteByFolder = buildSeriesRouteMap(files);

  fs.mkdirSync(TARGET_DIR, { recursive: true });

  for (const file of files) {
    const normalized = normalizeFile(file, slugBySourcePath, slugByBasename, seriesRouteByFolder);
    const targetPath = path.join(TARGET_DIR, `${file.data.slug}.mdx`);
    fs.writeFileSync(targetPath, normalized, 'utf8');
  }

  console.log(`Imported ${files.length} MDX files into ${TARGET_DIR}`);
}

function collectMdxFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return collectMdxFiles(fullPath);
    }

    if (entry.name === '_progress.md' || entry.name === '.gitkeep') {
      return [];
    }

    return entry.name.endsWith('.mdx') ? [fullPath] : [];
  });
}

function readSourceFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = parseMatter(raw);

  return {
    absolutePath: filePath,
    relativePath: path.relative(SOURCE_DIR, filePath),
    directoryName: path.basename(path.dirname(filePath)),
    body: parsed.content,
    data: parsed.data ?? {},
  };
}

function parseMatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return matter(raw);
  }

  const sanitized = sanitizeFrontmatter(match[1]);
  return matter(`---\n${sanitized}\n---\n${raw.slice(match[0].length)}`);
}

function sanitizeFrontmatter(frontmatter) {
  return frontmatter.replace(/^([A-Za-z_][\w-]*):\s*\[(.*)\]\s*$/gm, (_, key, rawItems) => {
    const items = rawItems
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        if (
          (item.startsWith('"') && item.endsWith('"')) ||
          (item.startsWith("'") && item.endsWith("'"))
        ) {
          return item;
        }

        return JSON.stringify(item);
      });

    return `${key}:\n${items.map((item) => `  - ${item}`).join('\n')}`;
  });
}

function buildSlugMap(files) {
  const slugByPath = new Map();
  const seenSlugs = new Map();

  for (const file of files) {
    const slug =
      typeof file.data.slug === 'string' && file.data.slug.length > 0
        ? file.data.slug
        : slugify(path.basename(file.absolutePath, '.mdx'));

    if (seenSlugs.has(slug)) {
      throw new Error(
        `Duplicate slug "${slug}" found in ${seenSlugs.get(slug)} and ${file.absolutePath}`,
      );
    }

    seenSlugs.set(slug, file.absolutePath);
    slugByPath.set(path.resolve(file.absolutePath), slug);
  }

  return slugByPath;
}

function buildBasenameSlugMap(files, slugBySourcePath) {
  const basenameMap = new Map();

  for (const file of files) {
    const basename = path.basename(file.absolutePath);
    const slug = slugBySourcePath.get(path.resolve(file.absolutePath));
    const existing = basenameMap.get(basename) ?? [];
    existing.push(slug);
    basenameMap.set(basename, existing);
  }

  return basenameMap;
}

function buildSeriesRouteMap(files) {
  const seriesMap = new Map();

  for (const file of files) {
    const folder = file.directoryName;
    const series =
      typeof file.data.topic === 'string' && file.data.topic ? file.data.topic : folder;
    seriesMap.set(folder, `/series/${encodeURIComponent(series)}/`);
  }

  return seriesMap;
}

function normalizeFile(file, slugBySourcePath, slugByBasename, seriesRouteByFolder) {
  const series = file.data.topic || file.directoryName;
  const type = file.data.type === 'index' ? 'index' : 'post';
  const seriesOrder = type === 'index' ? undefined : normalizeNumber(file.data.order);
  const tags = normalizeTags(file.data.tags, series);
  const description = buildDescription(file, series);
  const rewrittenBody = escapeAngleBracketsInMarkdown(
    rewriteRelativeLinks(file, slugBySourcePath, slugByBasename, seriesRouteByFolder),
  );
  const pubDate = normalizeDate(file.data.date);
  const updatedDate = normalizeDate(file.data.last_optimized);

  const frontmatter = {
    title: file.data.title ?? path.basename(file.absolutePath, '.mdx'),
    description,
    subtitle: typeof file.data.subtitle === 'string' ? file.data.subtitle : undefined,
    pubDate,
    updatedDate,
    tags: tags.length > 0 ? tags : undefined,
    lang: 'zh-CN',
    keywords: tags.length > 0 ? [...tags] : undefined,
    topic: typeof file.data.topic === 'string' ? file.data.topic : series,
    category: typeof file.data.category === 'string' ? file.data.category : undefined,
    type,
    series,
    seriesOrder,
    slug: typeof file.data.slug === 'string' ? file.data.slug : undefined,
    model: file.data.model,
  };

  return matter.stringify(rewrittenBody.trimStart(), pruneUndefined(frontmatter), {
    lineWidth: 0,
  });
}

function normalizeTags(value, series) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      [...value, series, '我不知道的']
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean),
    ),
  );
}

function buildDescription(file, series) {
  if (file.data.type === 'index') {
    return `《我不知道的 ${series}》系列导读、阅读路径与文章索引。`;
  }

  const bodyWithoutLeadHeading = file.body.replace(/^\s*# .*\n+/, '');
  const plainText = stripMarkdown(bodyWithoutLeadHeading)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('import ') && !line.startsWith('export '))
    .find((line) => line.length >= 24);

  if (!plainText) {
    return `${file.data.title ?? series}。`;
  }

  return truncate(plainText, 140);
}

function rewriteRelativeLinks(file, slugBySourcePath, slugByBasename, seriesRouteByFolder) {
  return file.body.replace(
    /\]\(((?:\.\/|\.\.\/)[^)]+?)(#[^)]+)?\)/g,
    (fullMatch, relativeTarget, hash = '') => {
      const normalizedTarget = relativeTarget.replace(/\/$/, '');
      const absoluteTarget = path.resolve(path.dirname(file.absolutePath), normalizedTarget);
      const directSlug = slugBySourcePath.get(absoluteTarget);

      if (directSlug) {
        return `](/posts/${directSlug}/${hash})`;
      }

      const basename = path.basename(normalizedTarget);
      const basenameMatches = slugByBasename.get(basename);
      if (basenameMatches?.length === 1) {
        return `](/posts/${basenameMatches[0]}/${hash})`;
      }

      const seriesRoute = seriesRouteByFolder.get(basename);
      if (seriesRoute) {
        return `](${seriesRoute}${hash})`;
      }

      return fullMatch;
    },
  );
}

function escapeAngleBracketsInMarkdown(content) {
  const fencePattern = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let result = '';

  for (const match of content.matchAll(fencePattern)) {
    const [block] = match;
    const index = match.index ?? 0;
    result += escapeAngleBracketsOutsideInlineCode(content.slice(lastIndex, index));
    result += block;
    lastIndex = index + block.length;
  }

  result += escapeAngleBracketsOutsideInlineCode(content.slice(lastIndex));
  return result;
}

function escapeAngleBracketsOutsideInlineCode(content) {
  const inlineCodePattern = /`[^`]*`/g;
  let lastIndex = 0;
  let result = '';

  for (const match of content.matchAll(inlineCodePattern)) {
    const [inlineCode] = match;
    const index = match.index ?? 0;
    result += content.slice(lastIndex, index).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    result += inlineCode;
    lastIndex = index + inlineCode.length;
  }

  result += content.slice(lastIndex).replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return result;
}

function normalizeDate(value) {
  if (!value) return undefined;

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  return undefined;
}

function normalizeNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function stripMarkdown(content) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#+\s*/gm, '')
    .replace(/^\|.*\|$/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/<[^>]+>/g, ' ');
}

function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function pruneUndefined(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  );
}

main();
