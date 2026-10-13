'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import type { Ref } from 'react';

type KeywordPillProps = HTMLMotionProps<'button'> & {
  label: string;
  pressed?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

export function KeywordPill({ label, pressed = false, className, ref, ...props }: KeywordPillProps) {
  return (
    <motion.button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      // 테두리 색은 Tailwind hover: 클래스(순수 CSS transition)로 둔다 — Motion의 whileHover로
      // borderColor를 애니메이션하면, hover가 끝날 때 그 순간의 computed 색을 rgb로 고정해
      // inline style에 남긴다. 다크 모드에서 호버했다가 라이트로 테마를 바꾸면 그 칩들만
      // border가 CSS 변수를 더 이상 따라가지 않고 이전 테마 색으로 굳어 보이는 버그가 있었다.
      // boxShadow는 색상 변수가 아니라(두 테마 모두 같은 rgb 그림자) Motion에 남겨도 안전하다.
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-pill border-[1.5px] border-line bg-surface px-6 py-3 type-label-pill text-fg shadow-sm transition-colors duration-180 ease-out hover:border-brand ${className ?? ''}`}
      whileHover={{
        boxShadow: 'var(--shadow-md)',
        transition: { duration: 0.18, ease: 'easeOut' },
      }}
      {...props}
    >
      {label}
    </motion.button>
  );
}
