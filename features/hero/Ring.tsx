'use client';

import { KeywordPill } from '@/components/ui/KeywordPill';
import { NavPill } from '@/components/ui/NavPill';
import type { HeroKeyword } from '@/types/content';
import { canUseRingLayout, computeRingPositions, computeStripLayout, type Point } from './geometry';

type RingProps = {
  keywords: HeroKeyword[];
  viewportWidth: number;
  viewportHeight: number;
  heroCopyCenterY: number;
  heroCopyHalfHeight: number;
  /** 슬롯에 들어간 keyword id. 이 칩은 Ring에서 자리를 비워둔다(spec 3·7장) */
  slot: string | null;
  /** Navigating 중이면 Ring 전체를 숨긴다(spec 5장) */
  navigating: boolean;
  onSelect: (keyword: HeroKeyword) => void;
  /** 칩 DOM 요소를 id로 등록해 포커스 이동(spec 10장)에 쓴다 */
  chipRefs: Map<string, HTMLElement>;
};

function renderChip(
  keyword: HeroKeyword,
  position: Point & { rotateDeg: number },
  onSelect: (keyword: HeroKeyword) => void,
  chipRefs: Map<string, HTMLElement>,
  stackOrder?: number,
) {
  const style = {
    left: position.x,
    top: position.y,
    transform: `translate(-50%, -50%) rotate(${position.rotateDeg}deg)`,
    zIndex: stackOrder,
  };
  const setRef = (el: HTMLElement | null) => {
    if (el) chipRefs.set(keyword.id, el);
    else chipRefs.delete(keyword.id);
  };

  if (keyword.type === 'nav') {
    return (
      <NavPill
        key={keyword.id}
        ref={setRef}
        label={keyword.label}
        href={keyword.href ?? '#'}
        className="pointer-events-auto absolute"
        style={style}
        onClick={(e) => {
          e.preventDefault();
          onSelect(keyword);
        }}
      />
    );
  }

  return (
    <KeywordPill
      key={keyword.id}
      ref={setRef}
      label={keyword.label}
      className="pointer-events-auto absolute"
      style={style}
      onClick={() => onSelect(keyword)}
    />
  );
}

export function Ring({
  keywords,
  viewportWidth,
  viewportHeight,
  heroCopyCenterY,
  heroCopyHalfHeight,
  slot,
  navigating,
  onSelect,
  chipRefs,
}: RingProps) {
  if (navigating) return null;

  // 슬롯에 들어간 칩은 Ring에서 자리를 비워둔다 — 나머지 칩은 각자의 각도/순서를 그대로 유지
  const visibleKeywords = keywords.filter((keyword) => keyword.id !== slot);

  const useRingLayout = canUseRingLayout(viewportWidth, viewportHeight);

  if (useRingLayout) {
    const positions = computeRingPositions({
      viewportWidth,
      viewportHeight,
      rotations: keywords.map((keyword) => keyword.ring.rotate),
    });
    const positionById = new Map(keywords.map((keyword, i) => [keyword.id, positions[i]]));

    return (
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden={false}>
        {visibleKeywords.map((keyword) => renderChip(keyword, positionById.get(keyword.id)!, onSelect, chipRefs))}
      </div>
    );
  }

  // 띠 배치: 링 순서(인덱스) 기준 앞쪽 절반은 위쪽 띠, 뒤쪽 절반은 아래쪽 띠 (spec 7장).
  // 위치는 항상 전체 칩 기준으로 계산하고(슬롯에 들어간 칩도 자리를 차지한 채로 계산), 렌더링
  // 시에만 슬롯에 들어간 칩을 제외한다 — 그래야 자리가 "비워질" 뿐 나머지 칩이 당겨붙지 않는다.
  const splitIndex = Math.ceil(keywords.length / 2);
  const topKeywords = keywords.slice(0, splitIndex);
  const bottomKeywords = keywords.slice(splitIndex);

  const { top, bottom } = computeStripLayout({
    viewportWidth,
    viewportHeight,
    topRotations: topKeywords.map((k) => k.ring.rotate),
    bottomRotations: bottomKeywords.map((k) => k.ring.rotate),
    heroCopyCenterY,
    heroCopyHalfHeight,
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden={false}>
      {/* 폭이 좁아 칩끼리 겹칠 때 링 순서(인덱스)가 뒤인 칩이 위로 쌓이게 z-index를 순서대로 준다 */}
      {topKeywords.map((keyword, i) => (keyword.id === slot ? null : renderChip(keyword, top[i], onSelect, chipRefs, i)))}
      {bottomKeywords.map((keyword, i) =>
        keyword.id === slot ? null : renderChip(keyword, bottom[i], onSelect, chipRefs, topKeywords.length + i),
      )}
    </div>
  );
}
