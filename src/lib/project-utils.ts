import type { CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

// Astro prefixes bundled assets with `base`, but not hand-written links. Prefix
// root-relative public paths here so sub-path deployments (GitHub Pages project
// sites) keep working. BASE_URL has no trailing slash for a configured base
// (e.g. `/portfolio`), so normalise it to always end with one.
const rawBase = import.meta.env.BASE_URL;
export const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
export const withBase = (path: string) => (path.startsWith('/') ? `${base}${path.slice(1)}` : path);

export const projectUrl = (project: Project) => withBase(`/projects/${project.data.slug}/`);
export const categoryKey = (category: string) => category.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const categoryUrl = (category: string) => withBase(`/projects/category/${categoryKey(category)}/`);
export const projectYear = (project: Project) => project.data.year ?? (project.data.date ? Number(project.data.date.slice(0,4)) : undefined);
export const sortProjects = (projects: Project[]) => [...projects].sort((a,b) => a.data.order-b.data.order || (projectYear(b) ?? 0)-(projectYear(a) ?? 0) || (b.data.date ?? '').localeCompare(a.data.date ?? '') || a.data.title.localeCompare(b.data.title, 'en'));
export function relatedProjects(project: Project, all: Project[], limit=3) {
  const score = (candidate: Project) => (candidate.data.category === project.data.category ? 3 : 0) + candidate.data.tags.filter(tag => project.data.tags.includes(tag)).length;
  return all.filter(candidate => candidate.id !== project.id && score(candidate)>0).sort((a,b) => score(b)-score(a) || all.indexOf(a)-all.indexOf(b)).slice(0,limit);
}
