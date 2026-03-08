import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
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
  }),
});

export const collections = { blog };
