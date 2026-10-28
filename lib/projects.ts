import { projects } from '@/content/projects';
import type { Project, ProjectDetail, ProjectImage, ProjectSlug } from '@/types/content';

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

/**
 * 상세 페이지에 보이는 이미지를 화면 순서대로(대표 이미지 → 섹션 이미지) 모은다 — 라이트박스 갤러리 범위.
 * sectionStarts[i]는 i번째 섹션의 첫 이미지가 images에서 몇 번째인지.
 */
export function getProjectImages(detail: ProjectDetail): {
  images: ProjectImage[];
  sectionStarts: number[];
} {
  const images = [detail.heroImage];
  const sectionStarts = detail.sections.map((section) => {
    const start = images.length;
    images.push(...(section.image ?? []));
    return start;
  });
  return { images, sectionStarts };
}
