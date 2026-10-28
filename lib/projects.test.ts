import { describe, expect, it } from 'vitest';
import { getProjectImages, getProjects } from './projects';
import type { ProjectDetail } from '@/types/content';

const image = (name: string) => ({ src: `/${name}.webp`, alt: name, width: 1640, height: 1006 });

describe('getProjectImages', () => {
  it('대표 이미지 → 섹션 이미지 순서로 모으고, 섹션별 시작 위치를 돌려준다', () => {
    const detail = {
      heroImage: image('hero'),
      sections: [
        { title: 'a', image: [image('a1')] },
        { title: 'b' },
        { title: 'c', image: [image('c1'), image('c2')] },
        { title: 'd', image: [image('d1')] },
      ],
    } as ProjectDetail;

    const { images, sectionStarts } = getProjectImages(detail);

    expect(images.map((item) => item.alt)).toEqual(['hero', 'a1', 'c1', 'c2', 'd1']);
    expect(sectionStarts).toEqual([1, 2, 2, 4]);
  });

  it('섹션 이미지가 없으면 대표 이미지 1장만 담는다', () => {
    const detail = { heroImage: image('hero'), sections: [{ title: 'a' }] } as ProjectDetail;

    expect(getProjectImages(detail).images).toHaveLength(1);
  });

  it('실제 프로젝트마다 다른 프로젝트 이미지가 섞이지 않는다', () => {
    for (const project of getProjects()) {
      if (!project.detail) continue;
      const { images } = getProjectImages(project.detail);
      for (const item of images) {
        expect(item.src).toContain(`/images/projects/${project.slug}/`);
      }
    }
  });
});
