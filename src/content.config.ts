import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const pages = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './content',
    generateId: ({ entry }) => entry.replace(/\.md$/i, '').replace(/\\/g, '/'),
  }),
  schema: z.object({
    title: z.string(),
    date: z.union([z.string(), z.date()]).optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { pages };
