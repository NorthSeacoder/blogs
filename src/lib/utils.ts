import type { CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';

export const format = {
  date: (value: Date) =>
    new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeZone: 'UTC' }).format(value),
};

export const sortPosts = (posts: CollectionEntry<'blog'>[]) =>
  [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

export const filterDrafts = (posts: CollectionEntry<'blog'>[]) => posts.filter((p) => !p.data.draft);

export const paginate = <T>(items: T[], pageSize: number) => {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }
  return pages;
};

export const estimateReadingTime = (content: string) => readingTime(content).text;
