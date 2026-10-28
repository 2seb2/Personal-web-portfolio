'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import type { ProjectImage } from '@/types/content';
import { Lightbox } from './Lightbox';

type LightboxContextValue = {
  open: (index: number, opener: HTMLElement) => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox() {
  return useContext(LightboxContext);
}

/** 본문 이미지(트리거 버튼) id — '본문에서 보기'가 이 id로 스크롤한다 */
export function getLightboxTargetId(index: number) {
  return `project-image-${index}`;
}

/**
 * 배경 페이지 스크롤을 막는다. 스크롤 위치는 건드리지 않아 닫으면 그 자리 그대로.
 * 스크롤바가 사라지며 본문이 옆으로 밀리지 않게 그 폭만큼 오른쪽 여백을 채운다.
 */
function lockScroll() {
  const html = document.documentElement;
  const { body } = document;
  const scrollbarWidth = window.innerWidth - html.clientWidth;
  const prev = { overflow: html.style.overflow, paddingRight: body.style.paddingRight };

  html.style.overflow = 'hidden';
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

  return () => {
    html.style.overflow = prev.overflow;
    body.style.paddingRight = prev.paddingRight;
  };
}

type LightboxProviderProps = {
  /** 현재 프로젝트 상세에 보이는 이미지 전체, 화면 순서대로 */
  images: ProjectImage[];
  children: ReactNode;
};

export function LightboxProvider({ images, children }: LightboxProviderProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const restoreScrollRef = useRef<(() => void) | null>(null);
  /** 닫힌 뒤(dialog가 DOM에서 빠진 뒤) 처리할 포커스·스크롤 */
  const afterCloseRef = useRef<{ index: number; reveal: boolean } | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const open = useCallback((index: number, opener: HTMLElement) => {
    openerRef.current = opener;
    restoreScrollRef.current ??= lockScroll();
    setOpenIndex(index);
  }, []);

  const handleClose = useCallback((options: { index: number; reveal: boolean }) => {
    restoreScrollRef.current?.();
    restoreScrollRef.current = null;
    afterCloseRef.current = options;
    setOpenIndex(null);
  }, []);

  // 모달이 열려 있는 동안엔 배경이 inert라 포커스를 옮길 수 없다 — 닫힌 뒤 커밋에서 처리
  useEffect(() => {
    if (openIndex !== null || !afterCloseRef.current) return;
    const { index, reveal } = afterCloseRef.current;
    afterCloseRef.current = null;

    if (reveal) {
      const target = document.getElementById(getLightboxTargetId(index));
      target?.scrollIntoView({ block: 'center', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      target?.focus({ preventScroll: true });
    } else {
      openerRef.current?.focus({ preventScroll: true });
    }
  }, [openIndex, prefersReducedMotion]);

  // 열린 채로 페이지를 떠나면(뒤로 가기 등) 스크롤 잠금을 풀어 둔다
  useEffect(() => () => restoreScrollRef.current?.(), []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <LightboxContext.Provider value={value}>
      {children}
      {openIndex !== null && (
        <Lightbox images={images} initialIndex={openIndex} onClose={handleClose} />
      )}
    </LightboxContext.Provider>
  );
}
