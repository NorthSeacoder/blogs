import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    canonical: z.string().url().optional(),
    lang: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
