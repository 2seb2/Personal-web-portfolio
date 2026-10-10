'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '@/content/site';
import { keywords } from '@/content/keywords';
import { Ring } from './Ring';

/** Nav 높이(px). Ring은 Hero 섹션(Nav 아래) 기준 좌표계를 쓰므로 섹션 자체 높이를 구할 때 뺀다 */
const NAV_HEIGHT_PX = 57;
const FALLBACK_SECTION_SIZE = { width: 1512, height: 982 - NAV_HEIGHT_PX };
/** Hero Copy 블록 실측 전 기본값(띠 배치 fallback, 대략적인 1512px 기준 블록 높이) */
const FALLBACK_HERO_COPY = { centerY: FALLBACK_SECTION_SIZE.height / 2, halfHeight: 130 };

export function Hero() {
  const { hero } = site;
  const sectionRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [sectionSize, setSectionSize] = useState(FALLBACK_SECTION_SIZE);
  const [heroCopyMetrics, setHeroCopyMetrics] = useState(FALLBACK_HERO_COPY);

  useEffect(() => {
    const updateMetrics = () => {
      setSectionSize({ width: window.innerWidth, height: window.innerHeight - NAV_HEIGHT_PX });

      const sectionRect = sectionRef.current?.getBoundingClientRect();
      const copyRect = copyRef.current?.getBoundingClientRect();
      if (sectionRect && copyRect) {
        setHeroCopyMetrics({
          centerY: copyRect.top - sectionRect.top + copyRect.height / 2,
          halfHeight: copyRect.height / 2,
        });
      }
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative flex min-h-[calc(100vh-57px)] items-center justify-center px-6 py-20 md:px-14"
    >
      <div className="hidden md:block">
        <Ring
          keywords={keywords}
          viewportWidth={sectionSize.width}
          viewportHeight={sectionSize.height}
          heroCopyCenterY={heroCopyMetrics.centerY}
          heroCopyHalfHeight={heroCopyMetrics.halfHeight}
        />
      </div>

      <div ref={copyRef} className="relative flex w-[min(846px,100%)] flex-col items-start gap-4.5">
        <p className="type-mono-xs text-brand-text">{hero.eyebrow}</p>

        <h1 className="type-display-hero flex flex-wrap items-center gap-3.5 text-fg-secondary">
          <span>
            {hero.name.before}
            <span className="type-display-hero-strong text-brand-text">{hero.name.strong}</span>
          </span>
          <span
            aria-label="키워드를 넣는 칸"
            className="type-heading-slot rounded-pill border-[1.5px] border-dashed border-brand px-6 py-2 text-fg-placeholder"
          >
            <span className="md:hidden">{hero.slotPlaceholder.mobile}</span>
            <span className="hidden md:inline">{hero.slotPlaceholder.desktop}</span>
          </span>
        </h1>

        <p aria-live="polite" className="type-lead whitespace-pre-line text-fg-secondary">
          {hero.subcopy.map((part, i) =>
            typeof part === 'string' ? (
              <span key={i}>{part}</span>
            ) : (
              <span key={i} className="text-brand-text">
                {part.strong}
              </span>
            ),
          )}
        </p>

        <p className="type-mono-xs text-fg-muted">
          <span className="md:hidden">{hero.hint.mobile}</span>
          <span className="hidden md:inline">{hero.hint.desktop}</span>
        </p>
      </div>
    </div>
  );
}
