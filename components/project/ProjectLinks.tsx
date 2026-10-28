import { site } from '@/content/site';
import type { Project } from '@/types/content';

/** 브랜드 로고는 면으로 그린다 — 24 그리드, 18px */
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function NotionIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
    </svg>
  );
}

const items = [
  { key: 'github', label: site.projectLinks.github, Icon: GitHubIcon },
  { key: 'notion', label: site.projectLinks.notion, Icon: NotionIcon },
] as const;

/**
 * 상세 Overview 제목 바로 오른쪽 — 있는 링크만 아이콘으로 보여 준다.
 * 누르는 영역은 32px, 음수 여백으로 제목 줄 높이는 그대로 둔다.
 */
export function ProjectLinks({ links }: { links: Project['links'] }) {
  const available = items.filter((item) => links?.[item.key]);
  if (available.length === 0) return null;

  return (
    <ul className="-my-1.5 flex shrink-0 items-center gap-1">
      {available.map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={links?.[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="group relative flex size-8 items-center justify-center rounded-pill text-fg transition-colors duration-180 ease-out hover:text-brand-text"
          >
            <Icon />
            {/* 라이트박스 툴바와 같은 이름표 — 호버·키보드 포커스 시 위에 */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-pill bg-inverse px-2.5 py-0.5 whitespace-nowrap type-mono-xs text-fg-inverse opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {label}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
