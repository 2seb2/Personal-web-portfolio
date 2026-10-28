'use client';

import type { ReactNode } from 'react';
import { site } from '@/content/site';
import { getLightboxTargetId, useLightbox } from './LightboxProvider';

type LightboxTriggerProps = {
  /** 갤러리(getProjectImages) 안에서의 순서 */
  index: number;
  alt: string;
  className?: string;
  /** 서버에서 렌더링한 본문 이미지 — 크기·배치는 그대로 두고 감싸기만 한다 */
  children: ReactNode;
};

export function LightboxTrigger({ index, alt, className, children }: LightboxTriggerProps) {
  const lightbox = useLightbox();

  return (
    <button
      type="button"
      id={getLightboxTargetId(index)}
      aria-label={site.lightbox.open(alt)}
      aria-haspopup="dialog"
      onClick={(event) => lightbox?.open(index, event.currentTarget)}
      className={`block w-full cursor-zoom-in text-left ${className ?? ''}`}
    >
      {children}
    </button>
  );
}
