import { projects } from '@/content/projects';
import type { Project, ProjectSlug } from '@/types/content';

export function getProjects(): Project[] {
  return [...projects].sort((a, b) => a.order - b.order);
}

export function getProject(slug: ProjectSlug): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** order 기준 다음 프로젝트. 마지막 프로젝트는 첫 번째로 순환 */
export function getNextProject(slug: ProjectSlug): Project {
  const sorted = getProjects();
  const index = sorted.findIndex((project) => project.slug === slug);
  return sorted[(index + 1) % sorted.length];
}
