import type { CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';

type BlogEntry = CollectionEntry<'blog'>;

export const format = {
  date: (value: Date) =>
    new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeZone: 'UTC' }).format(value),
};

export const sortPosts = (posts: BlogEntry[]) =>
  [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

export const filterDrafts = (posts: BlogEntry[]) => posts.filter((post) => !post.data.draft);

export const getSeriesName = (post: BlogEntry) => {
  if (post.data.series) return post.data.series;
  if (post.data.topic) return post.data.topic;

  const match = post.data.title.match(/^我不知道的\s*(.+?)(?:（\d+）)?\s*[-–—]/);
  return match?.[1] ?? null;
};

export const isSeriesIndex = (post: BlogEntry) => {
  if (post.data.type === 'index') return true;
  if (post.data.seriesOrder === 0) return true;
  return /系列导读|系列索引/.test(post.data.title);
};

export const filterContentPosts = (posts: BlogEntry[]) =>
  posts.filter((post) => !isSeriesIndex(post));

export const getPostDisplayTitle = (post: BlogEntry) => {
  if (isSeriesIndex(post)) return post.data.title;
  if (post.data.subtitle) return post.data.subtitle;

  const match = post.data.title.match(/^我不知道的\s*(.+?)(?:（\d+）)?\s*[-–—]\s*(.+)$/);
  return match?.[2] ?? post.data.title;
};

export const sortSeriesPosts = (posts: BlogEntry[]) =>
  [...posts].sort((a, b) => {
    if (a.data.seriesOrder !== undefined && b.data.seriesOrder !== undefined) {
      return a.data.seriesOrder - b.data.seriesOrder;
    }

    if (a.data.seriesOrder !== undefined) return -1;
    if (b.data.seriesOrder !== undefined) return 1;

    return a.data.pubDate.getTime() - b.data.pubDate.getTime();
  });

export interface SeriesGroup {
  name: string;
  indexPost?: BlogEntry;
  posts: BlogEntry[];
}

export const groupSeriesPosts = (posts: BlogEntry[]) => {
  const seriesMap = new Map<string, SeriesGroup>();

  posts.forEach((post) => {
    const seriesName = getSeriesName(post);
    if (!seriesName) return;

    const existing = seriesMap.get(seriesName) ?? {
      name: seriesName,
      posts: [],
    };

    if (isSeriesIndex(post)) {
      existing.indexPost = post;
    } else {
      existing.posts.push(post);
    }

    seriesMap.set(seriesName, existing);
  });

  return Array.from(seriesMap.values())
    .map((group) => ({
      ...group,
      posts: sortSeriesPosts(group.posts),
    }))
    .sort((a, b) => {
      if (b.posts.length !== a.posts.length) {
        return b.posts.length - a.posts.length;
      }

      return a.name.localeCompare(b.name, 'zh-CN');
    });
};

export const paginate = <T>(items: T[], pageSize: number) => {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }
  return pages;
};

export const estimateReadingTime = (content: string) => readingTime(content).text;

export const getTagParam = (tag: string) => {
  const normalized = tag
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return normalized || encodeURIComponent(tag).toLowerCase();
};

export const getTagPath = (tag: string) => `/tags/${getTagParam(tag)}/`;
