import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema } from './lib/project-schema';

const projects = defineCollection({
  loader: glob({
    base: './src/content/projects',
    pattern: '**/*.{md,mdx}',
    // File IDs stay unique independently of public slugs, so duplicate slugs
    // can be detected explicitly rather than silently overwriting an entry.
    generateId: ({ entry }) => entry,
  }),
  schema: projectSchema,
});

export const collections = { projects };
