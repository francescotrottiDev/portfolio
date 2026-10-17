import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

const text = z.string().trim().min(1);
const uniqueList = z.array(text).default([]).transform(values => [...new Set(values)]);
const publicPath = text.refine(value => /^\/(?!\/)/.test(value) && !value.includes('..') && !/[?#\\]/.test(value), 'Use a root-relative public file path, without traversal, queries, or fragments.');
const httpUrl = text.regex(/^https?:\/\//, 'Use an http(s) URL.');
const linkUrl = z.union([httpUrl, publicPath]);

export const projectSchema = ({ image }: SchemaContext) => {
  const picture = z.object({ image: image(), alt: text, caption: text.optional() });
  const fileVideo = z.object({
    kind: z.literal('file'), title: text,
    src: publicPath.refine(value => /\.(mp4|webm|ogv)$/i.test(value), 'Use an MP4, WebM, or OGV file.'),
    poster: image().optional(),
    silent: z.boolean().default(false),
    captions: publicPath.refine(value => /\.vtt$/i.test(value), 'Captions must be a WebVTT file.').optional(),
    caption: text.optional(),
  }).refine(video => video.silent || video.captions, 'Provide WebVTT captions for audio, or mark the video silent: true.');
  const embeddedVideo = z.object({
    kind: z.enum(['youtube', 'vimeo']), title: text, id: text,
    caption: text.optional(),
  }).superRefine((video, context) => {
    const valid = video.kind === 'youtube' ? /^[\w-]{11}$/.test(video.id) : /^\d+$/.test(video.id);
    if (!valid) context.addIssue({ code: 'custom', path: ['id'], message: `Invalid ${video.kind} video ID.` });
  });
  return z.object({
    slug: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a unique lowercase, hyphenated slug.'),
    title: text.max(180), description: text.max(500), longDescription: text.optional(),
    category: text.max(64),
    year: z.number().int().min(1900).max(2200).optional(),
    date: text.refine(value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value, 'Use a valid YYYY-MM-DD date.').optional(),
    cover: picture.optional(), images: z.array(picture).default([]),
    videos: z.array(z.union([fileVideo, embeddedVideo])).default([]),
    heroVideo: z.boolean().default(false),
    technologies: uniqueList, tags: uniqueList,
    status: z.enum(['Completed', 'In Progress', 'Planned', 'On Hold', 'Archived', 'Placeholder']).default('Planned'),
    featured: z.boolean().default(false), order: z.number().int().default(100),
    draft: z.boolean().default(false), placeholder: z.boolean().default(false),
    placeholderNote: text.optional(),
    illustration: z.enum(['linkage', 'network', 'circuit']).optional(),
    repository: httpUrl.optional(), demo: httpUrl.optional(),
    documentation: z.array(z.object({ label:text, url:linkUrl })).default([]),
  }).superRefine((project, context) => {
    if (project.date && project.year && Number(project.date.slice(0,4)) !== project.year) context.addIssue({ code:'custom', path:['year'], message:'Year must agree with date.' });
    if (project.heroVideo && !project.videos.length) context.addIssue({ code:'custom', path:['heroVideo'], message:'heroVideo requires at least one video.' });
    if (project.status === 'Placeholder' && !project.placeholder) context.addIssue({ code:'custom', path:['placeholder'], message:'A Placeholder status requires placeholder: true.' });
  });
};
