'use client';

import type { ButtonHTMLAttributes } from 'react';

type KeywordPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  pressed?: boolean;
};

export function KeywordPill({ label, pressed = false, className, ...props }: KeywordPillProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={`inline-flex items-center justify-center rounded-pill border-[1.5px] border-line bg-surface px-6 py-3 type-label-pill text-fg shadow-sm transition-[border-color,box-shadow] duration-180 ease-out hover:border-brand hover:shadow-md ${className ?? ''}`}
      {...props}
    >
      {label}
    </button>
  );
}
