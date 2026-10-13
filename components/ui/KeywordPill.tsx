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
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-pill border-[1.5px] border-line bg-surface px-6 py-3 type-label-pill text-fg shadow-sm ${className ?? ''}`}
      // whileHover에만 개별 transition(spec 6장: 0.18s ease-out)을 줘서, Ring이 최상위
      // transition prop으로 넘기는 레이아웃·드래그 전환(spring)과 서로 덮어쓰지 않게 한다.
      whileHover={{
        borderColor: 'var(--color-brand)',
        boxShadow: 'var(--shadow-md)',
        transition: { duration: 0.18, ease: 'easeOut' },
      }}
      {...props}
    >
      {label}
    </motion.button>
  );
}
