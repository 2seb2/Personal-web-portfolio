// 히어로 키워드. 배열 순서 = 데스크톱 링 순서(위쪽 가운데부터 시계 방향). spec 2장.
// 문구는 사실 확인을 거친 원고 — 임의로 다듬지 말 것.
import type { HeroKeyword } from '@/types/content';

export const keywords: HeroKeyword[] = [
  {
    id: 'rewrite',
    label: '다시 써보는',
    type: 'keyword',
    subcopy: '모바일로 직접 써보다 입력창을 누를 때마다 화면이 확대되는 문제를 발견했습니다.\n손가락 확대 기능은 그대로 두고, 자동 확대만 없앴습니다.',
    projectSlug: 'jikyeojwo-homes',
    ring: { rotate: -4 },
  },
  {
    id: 'e2e',
    label: 'E2E로 검증하는',
    type: 'keyword',
    subcopy: '실제 사용자처럼 화면을 조작하는 테스트(E2E)를 쓰다, 작성 중 페이지를 나가도 경고가 뜨지 않던 버그를 찾았습니다.\n고친 뒤 뒤로가기·새로고침·탭 닫기 세 경우 모두 테스트로 확인했습니다.',
    projectSlug: 'jikyeojwo-homes',
    ring: { rotate: 3 },
  },
  {
    id: 'go-projects',
    label: '프로젝트',
    type: 'nav',
    href: '/projects',
    trailing: '를 구경해봐요.',
    navigatingSubcopy: '잠시 후 프로젝트 목록으로 이동합니다.',
    ring: { rotate: -2 },
  },
  {
    id: 'bundle-47',
    label: 'Bundle −47%',
    type: 'keyword',
    subcopy: '처음 접속할 때 받는 파일 크기를 47% 줄였습니다.\n다시 써보니 남아 있던 짧은 빈 화면은 화면 뼈대(Skeleton UI)로 메워, 기다리는 순간의 경험까지 다듬었습니다.',
    projectSlug: 'boostad',
    ring: { rotate: 5 },
  },
  {
    id: 'coverage-72',
    label: 'Coverage 0→72%',
    type: 'keyword',
    subcopy: '다른 팀이 만든 낯선 코드를 넘겨받아, 테스트 129개로 기존 기능부터 지켜둔 뒤 코드를 정리했습니다.',
    projectSlug: 'web-os-emulator',
    ring: { rotate: -5 },
  },
  {
    id: 'seo',
    label: '검색에 띄운',
    type: 'keyword',
    subcopy: '배포 후 직접 검색해 보니 서비스가 검색 결과에 나오지 않았습니다.\n검색 엔진이 읽을 수 있게 설정을 채워 구글 검색 결과에 노출시켰습니다.',
    projectSlug: 'boostad',
    ring: { rotate: 2 },
  },
  {
    id: 'volunteer',
    label: '먼저 손 드는',
    type: 'keyword',
    subcopy: '코드를 올리면 자동으로 검사하고 배포되는 환경(CI/CD)을 자원해서 만들었습니다.',
    projectSlug: 'jikyeojwo-homes',
    ring: { rotate: -3 },
  },
  {
    id: 'go-articles',
    label: '아티클',
    type: 'nav',
    href: '/articles',
    trailing: '을 구경해봐요.',
    navigatingSubcopy: '잠시 후 아티클 목록으로 이동합니다.',
    ring: { rotate: 4 },
  },
  {
    id: 'ai-criteria',
    label: 'AI에 기준을 주는',
    type: 'keyword',
    subcopy: 'AI 해커톤 25팀 중 3위.\n팀원마다 제각각이던 AI 결과물을 디자인·기능 기준 문서로 맞춰 하나의 서비스로 묶었습니다.',
    ring: { rotate: -6 },
  },
  {
    id: 'new-domain',
    label: '낯선 도메인도 배우는',
    type: 'keyword',
    subcopy: '전세 사기 예방 서비스를 만들며 등기부등본을 직접 발급해보고,\n판례를 찾아 읽으며 부동산 지식을 익혔습니다.',
    projectSlug: 'jikyeojwo-homes',
    ring: { rotate: 3 },
  },
  {
    id: 'feedback',
    label: 'Feedback으로 다듬는',
    type: 'keyword',
    subcopy: '실제 사용자 피드백으로 광고 크기 선택 기능을 만들었습니다.\n모바일 블로그에서 광고가 안 보이던 문제는 원인과 해결법을 설치 화면에 바로 안내했습니다.',
    projectSlug: 'boostad',
    ring: { rotate: -2 },
  },
];
// TODO(세비): projectSlug 매핑이 실제 성과 출처와 맞는지 확인

/** 모바일 칩 목록 순서 (spec 2장) */
export const mobileOrder = ['go-projects', 'go-articles', 'bundle-47', 'coverage-72', 'rewrite', 'e2e', 'seo', 'volunteer', 'ai-criteria', 'new-domain', 'feedback'] as const;

/** 링 기하 기준값 (1512px 폭 기준, 화면 폭에 비례 — spec 7장) */
export const ringGeometry = {
  baseWidth: 1512,
  center: { x: 756, y: 528 },
  radius: { x: 610, y: 330 },
  heroBlockWidth: 846,
  navigateDelayMs: 1200,
  dropSlopPx: 16,
  dragThresholdPx: 5,
  edgePaddingPx: 16,
} as const;
