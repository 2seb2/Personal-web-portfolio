// 사이트 공통 문구. 사실 확인을 거친 원고 — 임의로 다듬지 말 것.

export const site = {
  name: 'SEBI.dev',
  author: '이세비',
  email: '2sebusiness.tech@gmail.com',
  url: 'http://localhost:3000', // TODO(세비): 배포 후 Vercel 주소 / 도메인으로 교체

  metadata: {
    title: '이세비 · Frontend Developer',
    description: '직접 써보고, 흐름이 끊기는 지점을 찾아 다듬는 프론트엔드 개발자 이세비의 포트폴리오입니다.',
  },

  nav: [
    { label: 'Projects', href: '/projects' },
    { label: 'Articles', href: '/articles' },
  ],

  hero: {
    eyebrow: 'Frontend Developer',
    name: { before: "I'm ", strong: '세비' },
    trailing: 'Developer.',
    slotPlaceholder: { desktop: '키워드를 끌어다 놓아보세요', mobile: '키워드를 탭해보세요' },
    /** 기본 서브 문구. 강조 구간은 brand-text 색 */
    subcopy: [
      '평소 쓰는 앱에서도 ',
      { strong: '흐름이 끊기는 지점' },
      '을 찾고,\n자연스럽게 이어질 때까지 다듬습니다.',
    ],
    hint: { desktop: '키워드를 drag or tap · 다시 누르면 reset', mobile: '키워드를 탭하면 문장이 바뀌어요' },
    tidyLabel: '칩 정리하기',
    live: {
      filled: (label: string) => `${label} 키워드를 넣었습니다. `,
      reset: '키워드를 비웠습니다.',
      tidy: '키워드를 원래 자리로 정리했습니다.',
    },
  },

  pages: {
    projects: { title: '프로젝트', description: '직접 써보며 끊기는 지점을 찾아 다듬은 프로젝트 4개입니다.' },
    articles: { title: '아티클', description: '만들면서 배운 것과 회고를 기록합니다.' },
  },

  /** 아티클 목록 쪽 나누기 */
  articleList: {
    pageTitle: (page: number) => `아티클 ${page}쪽`,
    pinned: 'Pinned',
    pagination: '아티클 목록 쪽',
    prev: '이전',
    next: '다음',
    page: (page: number) => `${page}쪽`,
  },

  /** 아티클 상세 */
  articleDetail: {
    back: '← All articles',
    /** 본문 이미지 라이트박스 */
    gallery: { title: 'Article Gallery', dialogLabel: '아티클 이미지 크게 보기' },
    /** alt(캡션)가 빈 본문 이미지를 라이트박스·버튼에서 부르는 이름 */
    imageAlt: (title: string, order: number) => `${title} 본문 이미지 ${order}`,
  },

  /** 프로젝트 상세 상단 외부 링크 아이콘 */
  projectLinks: {
    github: 'GitHub 저장소 열기',
    notion: 'Notion 문서 열기',
  },

  /** 프로젝트 상세 이미지 라이트박스 */
  lightbox: {
    title: 'Project Gallery',
    dialogLabel: '프로젝트 이미지 크게 보기',
    open: (alt: string) => `${alt} — 크게 보기`,
    close: '닫기',
    prev: '이전 이미지',
    next: '다음 이미지',
    toolbar: '이미지 조작',
    zoomOut: '축소',
    zoomIn: '확대',
    fit: '화면에 맞추기',
    reveal: '본문에서 보기',
    zoomLevel: '확대 비율 (화면 맞춤 크기 기준)',
    thumbnails: '이미지 목록',
    thumbnail: (order: number, alt: string) => `${order}번째 이미지: ${alt}`,
    position: (order: number, total: number) => `${total}장 중 ${order}번째 이미지`,
  },

  footer: {
    heading: '고민하고 노력한 결과를 마지막까지 봐주셔서 감사합니다.',
    note: '프론트엔드 신입 포지션을 찾고 있습니다.\n채용 제안이나 커피챗 모두 편하게 연락 주세요.',
    links: [
      { label: 'GitHub', href: 'https://github.com/2seb2' },
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/%EC%84%B8%EB%B9%84-%EC%9D%B4-6b6653403/?isSelfProfile=true',
      },
      { label: '이력서', href: '/LeeSebi-resume.pdf' },
    ],
    // TODO(세비): 임시 문구 — 확정 필요 (레퍼런스 사이트 문구와 겹치지 않게 바꿔 둔 것)
    copyright: '© 2026 이세비 — Figma에서 그리고, 코드로 만들고, 다시 써보며 다듬었습니다.',
  },
} as const;
