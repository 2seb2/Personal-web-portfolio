// 아티클 목데이터 — UI 확인용. 노션 API 연동(후순위) 시 lib/getArticles()의 내부만 교체하고 이 파일은 삭제.
// 제목은 Figma 기준. 날짜·태그·요약은 placeholder.
// TODO(세비): 실제 글이 정해지면 날짜·태그·요약 교체
import type { Article } from '@/types/content';

const placeholder = { date: '2026.03.28', tags: ['CS', 'Apollo Client', 'React Query'] };

export const articlesMock: Article[] = [
  { id: 'what-is-vercel', title: 'vercel이 뭘까?', excerpt: 'vercel에 대한 설명 (placeholder)', ...placeholder },
  { id: 'ddalkkak-retro', title: '딸깍톤 회고', excerpt: '회고 요약 (placeholder)', ...placeholder },
  { id: 'boostcamp-retro', title: '네부캠 수료 회고!', excerpt: '요약 (placeholder)', ...placeholder },
  { id: 'handling-ai', title: 'AI 다루기?', excerpt: '요약 (placeholder)', ...placeholder },
  { id: 'claude-update', title: 'Claude 업데이트', excerpt: '요약 (placeholder)', ...placeholder },
  { id: 'ci-cd', title: 'CI/CD', excerpt: '요약 (placeholder)', ...placeholder },
];
