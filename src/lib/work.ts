import { withBase } from '@/config/paths';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'work'>;

export const workPageSize = 6;

export const projectHref = (project: Project) => withBase(`/work/${project.id}/`);

/** Published case studies, in `order`, then newest first. */
export async function getProjects() {
  const projects = await getCollection('work', ({ data }) => !data.draft);
  return projects.sort((a, b) => a.data.order - b.data.order || (b.data.year ?? 0) - (a.data.year ?? 0));
}

export const workPageHref = (page: number) => withBase(page <= 1 ? '/work/' : `/work/page/${page}/`);
