'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';

function subscribe() {
  return () => {};
}

/** 서버에서는 false, 클라이언트 하이드레이션 후에는 true — next-themes 깜빡임 방지 */
function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="2.667" stroke="currentColor" strokeWidth="1.333" />
      <path
        stroke="currentColor"
        strokeWidth="1.333"
        strokeLinecap="round"
        d="M8 1.333v1.334M8 13.333v1.334M3.287 3.287l.94.94M11.773 11.773l.94.94M1.333 8h1.334M13.333 8h1.334M4.227 11.773l-.94.94M12.713 3.287l-.94.94"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        stroke="currentColor"
        strokeWidth="1.333"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 2c-.796.796-1.243 1.875-1.243 3s.447 2.204 1.243 3c.796.796 1.875 1.243 3 1.243s2.204-.447 3-1.243c0 1.187-.352 2.347-1.011 3.333a6.01 6.01 0 0 1-2.693 2.21 6.023 6.023 0 0 1-3.467.235 6.014 6.014 0 0 1-3.072-1.638 6.003 6.003 0 0 1-1.638-3.072 6.01 6.01 0 0 1 .235-3.467 6.01 6.01 0 0 1 2.21-2.693A6.023 6.023 0 0 1 8 2Z"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="다크 모드"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative inline-flex items-center gap-0.5 rounded-pill border border-line bg-surface p-0.75"
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.75 left-0.75 flex size-7.5 items-center justify-center rounded-pill bg-inverse text-fg-inverse transition-transform duration-200 ease-out ${
          isDark ? 'translate-x-8' : 'translate-x-0'
        }`}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
      <span className="flex size-7.5 items-center justify-center text-fg-secondary">
        <SunIcon className={isDark ? '' : 'invisible'} />
      </span>
      <span className="flex size-7.5 items-center justify-center text-fg-secondary">
        <MoonIcon className={isDark ? 'invisible' : ''} />
      </span>
    </button>
  );
}
