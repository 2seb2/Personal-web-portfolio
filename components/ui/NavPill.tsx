'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import type { Ref } from 'react';

type NavPillProps = HTMLMotionProps<'a'> & {
  label: string;
  href: string;
  ref?: Ref<HTMLAnchorElement>;
};

export function NavPill({ label, href, className, ref, ...props }: NavPillProps) {
  return (
    <motion.a
      ref={ref}
      href={href}
      className={`group inline-flex items-center whitespace-nowrap rounded-pill border-[1.5px] border-transparent bg-inverse py-3 pr-5.5 pl-6 type-label-pill text-fg-inverse shadow-sm transition-[gap] duration-180 ease-out gap-2 hover:gap-3.5 ${className ?? ''}`}
      // whileHover에만 개별 transition(spec 6장: 0.18s ease-out)을 줘서, Ring이 최상위
      // transition prop으로 넘기는 레이아웃·드래그 전환(spring)과 서로 덮어쓰지 않게 한다.
      whileHover={{
        borderColor: 'var(--color-brand)',
        boxShadow: 'var(--shadow-md)',
        transition: { duration: 0.18, ease: 'easeOut' },
      }}
      {...props}
    >
      <span>{label}</span>
      <span aria-hidden="true">→</span>
    </motion.a>
  );
}
