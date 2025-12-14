import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { filterDrafts, sortPosts } from '../lib/utils';
import { siteConfig } from '../lib/siteConfig';

export async function GET() {
  const posts = sortPosts(filterDrafts(await getCollection('blog')));
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: siteConfig.siteUrl,
    items: posts.map((post) => ({
      link: `/posts/${post.slug}/`,
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
    })),
  });
}
