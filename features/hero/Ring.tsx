'use client';

import { KeywordPill } from '@/components/ui/KeywordPill';
import { NavPill } from '@/components/ui/NavPill';
import type { HeroKeyword } from '@/types/content';
import { computeRingPositions } from './geometry';

type RingProps = {
  keywords: HeroKeyword[];
  viewportWidth: number;
  viewportHeight: number;
};

export function Ring({ keywords, viewportWidth, viewportHeight }: RingProps) {
  const positions = computeRingPositions({
    viewportWidth,
    viewportHeight,
    rotations: keywords.map((keyword) => keyword.ring.rotate),
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden={false}>
      {keywords.map((keyword, i) => {
        const position = positions[i];
        const style = {
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) rotate(${position.rotateDeg}deg)`,
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
          <KeywordPill
            key={keyword.id}
            label={keyword.label}
            className="pointer-events-auto absolute"
            style={style}
          />
        );
      })}
    </div>
  );
}
