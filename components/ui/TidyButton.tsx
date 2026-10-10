import type { ButtonHTMLAttributes } from 'react';

type TidyButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

function TidyIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1.5 6c0 .89.264 1.76.758 2.5.495.74 1.198 1.317 2.02 1.658.823.34 1.727.429 2.6.255.873-.173 1.675-.602 2.304-1.231.63-.63 1.058-1.431 1.232-2.305.173-.873.085-1.778-.256-2.6a4.502 4.502 0 0 0-1.658-2.02A4.498 4.498 0 0 0 6 1.5c-1.258.005-2.466.496-3.37 1.37L1.5 4"
      />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M1.5 1.5V4H4" />
    </svg>
  );
}

export function TidyButton({ label, className, ...props }: TidyButtonProps) {
  return (
    <button
      type="button"
      className={`group inline-flex items-center gap-1.5 py-0.5 type-mono-xs text-fg-secondary transition-colors duration-180 ease-out hover:text-brand-text ${className ?? ''}`}
      {...props}
    >
      <span className="transition-colors group-hover:text-brand-text">
        <TidyIcon />
      </span>
      <span className="group-hover:underline">{label}</span>
    </button>
  );
}
