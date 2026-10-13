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
      className={`group inline-flex items-center whitespace-nowrap rounded-pill border-[1.5px] border-transparent bg-inverse py-3 pr-5.5 pl-6 type-label-pill text-fg-inverse shadow-sm transition-[gap,border-color,box-shadow] duration-180 ease-out gap-2 hover:gap-3.5 hover:border-brand hover:shadow-md ${className ?? ''}`}
      {...props}
    >
      <span>{label}</span>
      <span aria-hidden="true">→</span>
    </motion.a>
  );
}
