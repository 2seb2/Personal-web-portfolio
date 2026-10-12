'use client';

import { KeywordPill } from '@/components/ui/KeywordPill';
import { NavPill } from '@/components/ui/NavPill';
import { mobileOrder } from '@/content/keywords';
import type { HeroKeyword } from '@/types/content';

type MobileKeywordListProps = {
  keywords: HeroKeyword[];
  slot: string | null;
  navigating: boolean;
  onSelect: (keyword: HeroKeyword) => void;
  /** 칩 DOM 요소를 id로 등록해 포커스 이동(spec 10장)에 쓴다 */
  chipRefs: Map<string, HTMLElement>;
};

/**
 * 모바일(768px 미만) 칩 목록. 시각 순서는 spec 2장 `mobileOrder`를 따르고, 드래그·기울기
 * 없이 줄바꿈으로 흐른다. DOM 순서를 mobileOrder로 둬 Tab 순서도 같이 따라가게 한다
 * (spec 10장의 "Ring 순서" 원칙을 데스크톱/띠 레이아웃 기준으로 보고, 모바일은 2장의 전용
 * 순서를 쓰기로 함 — 3-2 결정).
 */
export function MobileKeywordList({ keywords, slot, navigating, onSelect, chipRefs }: MobileKeywordListProps) {
  if (navigating) return null;

  const byId = new Map(keywords.map((keyword) => [keyword.id, keyword]));
  const orderedKeywords = mobileOrder.map((id) => byId.get(id)!).filter((keyword) => keyword.id !== slot);

  return (
    <div className="mt-8 flex flex-wrap gap-2.5 md:hidden">
      {orderedKeywords.map((keyword) => {
        const setRef = (el: HTMLElement | null) => {
          if (el) chipRefs.set(keyword.id, el);
          else chipRefs.delete(keyword.id);
        };

        return keyword.type === 'nav' ? (
          <NavPill
            key={keyword.id}
            ref={setRef}
            label={keyword.label}
            href={keyword.href ?? '#'}
            onClick={(e) => {
              e.preventDefault();
              onSelect(keyword);
            }}
          />
        ) : (
          <KeywordPill key={keyword.id} ref={setRef} label={keyword.label} onClick={() => onSelect(keyword)} />
        );
      })}
    </div>
  );
}
