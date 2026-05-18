import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    tags: z.array(z.string()).default([]),
    links: z.object({
      live: z.string().url().optional(),
      repo: z.string().url().optional(),
    }),
    thumbnail: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    accent: z.string().default('#d5ff3f'),
  }),
});

export const collections = { projects };
