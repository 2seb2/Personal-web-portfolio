'use client';

import Link from 'next/link';
import { markHeroResetPending } from '@/features/hero/resetEvent';

type HomeLinkProps = {
  label: string;
};

/**
 * 로고(홈 링크). 클릭하면 어디서 왔든 히어로 상태를 초기화한다 — 다른 페이지에서 눌러 홈으로
 * 돌아올 때는 물론, 이미 홈에 있을 때 눌러도 칩 배치가 Empty로 리셋된다.
 */
export function HomeLink({ label }: HomeLinkProps) {
  return (
    <Link href="/" className="type-mono-label text-fg" onClick={markHeroResetPending}>
      {label}
    </Link>
  );
}
