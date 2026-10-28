import type { ReactNode } from 'react';
import { site } from '@/content/site';

/** 아티클 목록 페이지 틀 — 제목·설명은 쪽과 관계없이 같고, 목록·쪽 번호만 children으로 바뀐다 */
export function ArticleIndex({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-242 flex-col gap-14 px-6 pt-20 pb-30 md:px-14 md:pt-30 md:pb-40">
      <div className="flex flex-col gap-3">
        <h1 className="type-display-lg text-fg">{site.pages.articles.title}</h1>
        <p className="type-body-lg text-fg-secondary">{site.pages.articles.description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}
