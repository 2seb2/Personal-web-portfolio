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
      // 테두리 색은 Tailwind hover: 클래스(순수 CSS transition)로 둔다 — KeywordPill과 같은 이유로
      // Motion whileHover의 borderColor는 호버 종료 시 그 순간의 computed 색을 inline style에
      // rgb로 고정해, 테마를 바꿔도 CSS 변수를 더 이상 따라가지 않는 버그가 있었다.
      className={`group inline-flex items-center whitespace-nowrap rounded-pill border-[1.5px] border-transparent bg-inverse py-3 pr-5.5 pl-6 type-label-pill text-fg-inverse shadow-sm transition-[gap,border-color] duration-180 ease-out gap-2 hover:gap-3.5 hover:border-brand ${className ?? ''}`}
      // whileHover에만 개별 transition(spec 6장: 0.18s ease-out)을 줘서, Ring이 최상위
      // transition prop으로 넘기는 레이아웃·드래그 전환(spring)과 서로 덮어쓰지 않게 한다.
      whileHover={{
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
