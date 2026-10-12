'use client';

import type { ButtonHTMLAttributes, Ref } from 'react';

type KeywordPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  pressed?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

export function KeywordPill({ label, pressed = false, className, ref, ...props }: KeywordPillProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-pill border-[1.5px] border-line bg-surface px-6 py-3 type-label-pill text-fg shadow-sm transition-[border-color,box-shadow] duration-180 ease-out hover:border-brand hover:shadow-md ${className ?? ''}`}
      {...props}
    >
      {label}
    </button>
  );
}
