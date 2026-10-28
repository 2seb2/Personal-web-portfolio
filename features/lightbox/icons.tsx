import type { ReactNode } from 'react';

/**
 * 라이트박스 아이콘 공통 틀 — 24 그리드, 선 두께 2, 둥근 끝. 20px로 그린다.
 * ThemeToggle 아이콘(16 그리드 · 선 1.333)과 같은 선 비율이라 사이트 아이콘과 굵기가 맞는다.
 */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function CloseIcon() {
  return (
    <Icon>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  );
}

export function ChevronLeftIcon() {
  return (
    <Icon>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  );
}

export function ChevronRightIcon() {
  return (
    <Icon>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  );
}

export function ZoomOutIcon() {
  return (
    <Icon>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35M8 11h6" />
    </Icon>
  );
}

export function ZoomInIcon() {
  return (
    <Icon>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35M8 11h6M11 8v6" />
    </Icon>
  );
}

export function MaximizeIcon() {
  return (
    <Icon>
      <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
    </Icon>
  );
}

/** 본문에서 보기 — 펼친 책 */
export function BookOpenIcon() {
  return (
    <Icon>
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </Icon>
  );
}
