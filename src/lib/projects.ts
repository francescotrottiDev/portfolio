import { getCollection } from 'astro:content';
import { existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { categoryKey, sortProjects, type Project } from './project-utils';

/** Build-time repository: all routes and homepage selection use this one source. */
export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection('projects');
  const slugs = new Set<string>();
  const categories = new Map<string,string>();
  const publicRoot = resolve('public');
  const checkFile = (path: string, project: Project) => {
    const file = resolve(publicRoot, `.${decodeURIComponent(path)}`);
    if (!file.startsWith(publicRoot+sep) || !existsSync(file)) throw new Error(`${project.id}: missing public file ${path}`);
  };
  for (const project of entries) {
    const { slug, category, documentation, videos } = project.data;
    if (slugs.has(slug)) throw new Error(`Duplicate project slug "${slug}". Each Markdown/MDX file needs a unique slug.`);
    slugs.add(slug);
    const key = categoryKey(category);
    if (!key || (categories.has(key) && categories.get(key) !== category)) throw new Error(`Category "${category}" has an empty or conflicting URL key.`);
    categories.set(key,category);
    for (const link of documentation) if (link.url.startsWith('/')) checkFile(link.url,project);
    for (const video of videos) if (video.kind === 'file') {
      checkFile(video.src,project);
      if (video.captions) checkFile(video.captions,project);
    }
  }
  return sortProjects(entries.filter(project => !project.data.draft));
}

export const getFeaturedProjects = async (limit=3) => (await getProjects()).filter(project => project.data.featured).slice(0,limit);
