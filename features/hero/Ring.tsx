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
};

function renderChip(keyword: HeroKeyword, position: Point & { rotateDeg: number }, stackOrder?: number) {
  const style = {
    left: position.x,
    top: position.y,
    transform: `translate(-50%, -50%) rotate(${position.rotateDeg}deg)`,
    zIndex: stackOrder,
  };

  if (keyword.type === 'nav') {
    return (
      <NavPill
        key={keyword.id}
        label={keyword.label}
        href={keyword.href ?? '#'}
        className="pointer-events-auto absolute"
        style={style}
      />
    );
  }

  return (
    <KeywordPill key={keyword.id} label={keyword.label} className="pointer-events-auto absolute" style={style} />
  );
}

export function Ring({ keywords, viewportWidth, viewportHeight, heroCopyCenterY, heroCopyHalfHeight }: RingProps) {
  const useRingLayout = canUseRingLayout(viewportWidth, viewportHeight);

  if (useRingLayout) {
    const positions = computeRingPositions({
      viewportWidth,
      viewportHeight,
      rotations: keywords.map((keyword) => keyword.ring.rotate),
    });

    return (
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden={false}>
        {keywords.map((keyword, i) => renderChip(keyword, positions[i]))}
      </div>
    );
  }

  // 띠 배치: 링 순서(인덱스) 기준 앞쪽 절반은 위쪽 띠, 뒤쪽 절반은 아래쪽 띠 (spec 7장).
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
      {topKeywords.map((keyword, i) => renderChip(keyword, top[i], i))}
      {bottomKeywords.map((keyword, i) => renderChip(keyword, bottom[i], topKeywords.length + i))}
    </div>
  );
}
