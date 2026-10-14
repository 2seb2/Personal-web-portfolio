// 콘텐츠 타입 — content/*.ts가 이 타입을 따른다.

/** 텍스트 안의 강조 구간. "**굵게**" 마크업 대신 배열로 표현해 파싱이 필요 없게 한다. */
export type RichText = Array<string | { strong: string }>;

// ---------- Hero ----------
export type HeroKeyword = {
  id: string;
  label: string;
  type: 'keyword' | 'nav';
  /** keyword일 때. 줄바꿈은 '\n' */
  subcopy?: string;
  /** nav일 때 */
  href?: '/projects' | '/articles';
  /** nav일 때 슬롯 뒤 꼬리말 (조사 포함) */
  trailing?: string;
  /** nav일 때 Navigating 상태의 서브 문구 */
  navigatingSubcopy?: string;
  /** 관련 프로젝트. 지금은 데이터만 (UI 연결 없음) */
  projectSlug?: ProjectSlug;
  /** 링 위 기울기(°). 위치는 순서로 자동 계산 (spec 7장) */
  ring: { rotate: number };
};

// ---------- Projects ----------
export type ProjectSlug = 'jikyeojwo-homes' | 'boostad' | 'web-os-emulator' | 'namota-igeota';

export type ProjectBlockLabel = '발견' | '원인' | '판단' | '결과' | '문제' | '해결' | '검토';

export type ProjectSection = {
  /** 번호가 있는 문제 섹션이면 1부터. Overview·서비스 흐름 등은 없음 */
  index?: number;
  title: string;
  /** 일반 문단 (라벨 없음) */
  paragraphs?: string[];
  /** 라벨이 붙은 문단 — 라벨은 brand-text 색 + body-md-strong. text의 강조 구간은 RichText */
  blocks?: Array<{ label: ProjectBlockLabel; text: string | RichText }>;
  /** 섹션 안 이미지 */
  image?: { src: string; alt: string; width: number; height: number };
  /** 섹션 끝 인용 박스 (bg-sunken + 왼쪽 brand 선) */
  callout?: string;
  /** 글머리표 목록 (결과 섹션) */
  list?: string[];
  /** 목록 아래 보조 문단 (예: '아직 확인하지 못한 것') */
  note?: { label: string; text: string };
};

export type ProjectDetail = {
  /** 상세 상단 라벨. 예: "Project 01 — Web · 2026" */
  eyebrow: string;
  title: string;
  summary: string;
  heroImage: { src: string; alt: string; width: number; height: number };
  meta: Array<{ term: '역할' | '기간' | '담당' | '스택'; value: string[] }>;
  sections: ProjectSection[];
};

export type Project = {
  slug: ProjectSlug;
  order: number;
  /** 카드 메타 왼쪽: "01 · 지켜줘홈즈" 의 이름 부분 */
  name: string;
  /** 카드 메타 오른쪽 */
  period: string;
  team: string;
  /** 카드 제목 */
  title: string;
  /** 카드 글머리표 (2~3개) */
  highlights: RichText[];
  thumbnail?: { src: string; alt: string };
  links?: { github?: string; notion?: string; demo?: string };
  /** 상세 페이지가 없으면 카드 클릭 시 links.github → links.notion 순서로 외부 이동 */
  detail?: ProjectDetail;
};

// ---------- Articles (목데이터. 노션 연동은 후순위) ----------
export type Article = {
  id: string;
  title: string;
  date: string; // YYYY.MM.DD
  tags: string[];
  excerpt: string;
  href?: string;
};
