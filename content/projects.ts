// 프로젝트 데이터. 카드 4개 + 상세(지금은 지켜줘 홈즈만 Figma에 설계됨).
// 문구는 사실 확인을 거친 원고 — 임의로 다듬지 말 것. TODO(세비)는 임시 값(나중에 사용자가 확정).
import type { Project } from '@/types/content';

export const projects: Project[] = [
  {
    slug: 'jikyeojwo-homes',
    order: 1,
    name: '지켜줘홈즈',
    period: '2026.04 – 06',
    team: '3인 팀',
    title: '전세 계약 전, AI가 위험 요소를 분석해 주는 서비스',
    highlights: [
      ['사용 시나리오 ', { strong: '32개 자동 검증' }, ', 숨어 있던 버그 4건 수정'],
      ['모바일 입력창 자동 확대 제거, 손가락 확대는 유지'],
      ['머지 전 ', { strong: '오류 21회 자동 차단' }, ' (CI 152회 중)'],
    ],
    thumbnail: { src: '/images/projects/jikyeojwo-homes/thumb.webp', alt: '지켜줘홈즈 정보 입력 화면' }, // 지금은 placeholder — TODO(세비): 실제 이미지로 교체
    links: { github: 'https://github.com/S1J2-Lab/home-protect-client' },
    detail: {
      eyebrow: 'Project 01 — Web · 2026',
      title: '전세 계약 전, AI가 위험 요소를 분석해주는 서비스',
      summary: '전세 계약 전 AI가 위험 요소를 분석해 주는 서비스에서, 정보 입력·파일 업로드 화면과 그 흐름을 지키는 테스트·배포를 맡았습니다.',
      // TODO(세비): 지금은 회색 placeholder 이미지 — 같은 파일명으로 실제 이미지 교체
      heroImage: { src: '/images/projects/jikyeojwo-homes/hero.webp', alt: '지켜줘홈즈 서비스 화면', width: 1640, height: 874 },
      meta: [
        { term: '역할', value: ['Frontend Developer', '3인 팀 (FE 2 · BE 1)'] },
        { term: '기간', value: ['2026.04 – 06'] },
        { term: '담당', value: ['입력·업로드 화면', 'E2E 테스트 · CI/CD'] },
        { term: '스택', value: ['React · TypeScript', 'Playwright · GitHub Actions'] },
      ],
      sections: [
        {
          title: 'Overview',
          paragraphs: [
            // TODO(세비): 75% 통계 출처(기관명·기준일)를 각주로 표기
            '전세사기 피해의 75%가 2030 청년층에 몰려 있습니다. 등기부등본을 혼자 읽으려면 법률 지식이 필요하고, 전문가에게 맡기기엔 비용이 부담됩니다. 지켜줘 홈즈는 서류를 올리면 1~2분 안에 전세가율·등기부등본·계약서 독소조항·건축물 현황을 한 번에 분석해 주는 무료 서비스입니다.',
            '저는 사용자가 서비스에 들어와 정보를 입력하고 서류를 올리는 구간을 맡았습니다. 그리고 그 구간부터 결과까지 전체 흐름이 배포할 때마다 깨지지 않도록 테스트와 배포 자동화를 만들었습니다.',
          ],
          callout: '처음 쓰는 사람이 서류를 올리고 결과를 받기까지, 중간에 멈추거나 되돌아가는 순간이 없어야 했습니다.',
        },
        {
          title: '서비스 흐름',
          // TODO(세비): 지금은 회색 placeholder 이미지 — 서비스 흐름 이미지/영상으로 교체
          image: { src: '/images/projects/jikyeojwo-homes/flow.webp', alt: '주소 검색부터 결과 확인까지의 서비스 흐름', width: 1640, height: 1006 },
          callout: '서비스는 위와 같은 흐름입니다.', // TODO(세비): 임시 문장 — 이미지 설명 확정
        },
        {
          index: 1,
          title: '입력할 때마다 확대되던 화면',
          blocks: [
            { label: '발견', text: '모바일로 직접 써보다, 입력창을 누를 때마다 화면이 자동으로 확대되는 걸 느꼈습니다. 하단 버튼을 누르려면 매번 손으로 축소해야 했습니다.' },
            { label: '원인', text: '입력창 글자 크기가 14px로, 모바일 브라우저가 자동 확대를 거는 기준(16px 미만)에 걸려 있었습니다.' },
            { label: '판단', text: '확대 기능 자체를 막는 방법도 있었지만, 그러면 화면을 키워 봐야 하는 사용자까지 막게 됩니다. 접근성 지침(WCAG) 위반이라 배제했습니다.' },
            { label: '결과', text: '글자 크기를 16px로 올리고 높이 변화는 여백으로 보정했습니다. 손가락 확대는 그대로 두고 자동 확대만 사라졌습니다.' },
          ],
          callout: '데스크탑에서는 보이지 않던 문제였습니다. 직접 써보지 않았다면 지나쳤을 겁니다.',
        },
        {
          index: 2,
          title: '나가도 아무 말 없던 페이지',
          blocks: [
            { label: '발견', text: 'E2E 테스트를 쓰다가, 내용을 입력한 채 페이지를 나가도 "작성 내용이 사라진다"는 경고가 뜨지 않는 걸 발견했습니다.' },
            { label: '원인', text: '이탈을 판단하는 함수가 입력값의 첫 상태만 기억하고 있어서, 값이 바뀌어도 계속 "입력 없음"으로 판단하고 있었습니다.' },
            { label: '판단', text: '원인은 최신 값을 참조하도록 고쳤습니다. 그런데 새로고침과 탭 닫기는 브라우저 정책상 직접 만든 경고창을 띄울 수 없었습니다. 경로마다 다른 경고창이 뜨는 것보다 일관된 게 낫다고 보고, 모든 이탈 경로를 브라우저 기본 경고창으로 통일했습니다.' },
            { label: '결과', text: '뒤로가기·새로고침·탭 닫기 세 경로 모두 입력이 있을 때만 경고하고, 정상 제출할 때는 뜨지 않는 것까지 테스트로 확인했습니다.' },
          ],
          callout: '서류를 다시 찾아 올려야 하는 사용자에게, 실수로 한 번 나가는 건 작은 일이 아닙니다.',
        },
        {
          index: 3,
          title: '손으로 다 확인할 수 없던 전체 흐름',
          blocks: [
            { label: '문제', text: '업로드부터 결과까지를 배포할 때마다 손으로 확인할 수는 없어서 E2E 테스트를 도입했습니다. 그런데 분석 진행 상황을 실시간으로 받는 구간(SSE)은 Playwright의 가짜 응답이 적용되지 않아, 정상 완료·에러·무한 대기 상황을 재현할 수 없었습니다.' },
            { label: '판단', text: '테스트 때문에 서비스 코드에 분기를 넣고 싶지 않았습니다. 그래서 테스트 브라우저가 뜰 때만 실시간 수신 기능을 가짜로 교체하는 방식을 택했습니다.' },
            { label: '결과', text: '원하는 상황을 자유롭게 넣을 수 있게 됐고, 전체 흐름 32개 시나리오를 자동화했습니다. 그 과정에서 2번 이탈 경고 버그를 포함해 숨어 있던 버그 4건을 찾아 고쳤습니다.' },
          ],
          callout: '테스트는 확인 도구이기도 했지만, 직접 써봐도 안 보이던 버그를 찾는 방법이기도 했습니다.',
        },
        {
          index: 4,
          title: '사용자 밖의 흐름: 팀의 배포',
          blocks: [
            { label: '문제', text: '머지 전에 타입·린트 오류를 걸러주는 장치가 없었고, 배포도 매번 손으로 했습니다. Vercel은 조직 저장소에서 유료 플랜 없이 쓸 수 없었습니다.' },
            { label: '판단', text: 'PR 검증과 배포를 분리하고, 검사를 통과해야만 머지되도록 막았습니다. 배포는 S3 + CloudFront로 직접 구성했습니다.' },
            { label: '결과', text: '운영 기간 CI 152회 중 21회를 머지 전에 막았고, main에 머지하면 자동 배포됩니다. 코드 스타일은 CI가, 1차 점검은 자동 리뷰(CodeRabbit)가 맡아 리뷰어는 로직에 집중할 수 있었습니다.' },
          ],
          // TODO(세비): 임시 문장 — 확정 필요
          callout: '배포를 사람의 기억에 맡기지 않는 것도 흐름을 지키는 일이었습니다.',
        },
        {
          title: '결과',
          list: [
            '모바일 입력 시 매번 필요하던 수동 축소 동작 제거',
            '세 가지 이탈 경로 모두에서 작성 내용 유실 방지',
            '전체 흐름 32개 시나리오 자동 검증, 버그 4건 수정',
            'CI 152회 중 21회 머지 전 차단, 배포 자동화',
          ],
          note: { label: '아직 확인하지 못한 것', text: '실사용자 지표는 없습니다. 위 개선은 직접 사용과 테스트로 검증한 결과입니다.' },
        },
        {
          title: '회고',
          paragraphs: [
            '예전에는 구현이 되면 끝이라고 생각했습니다. 이번에는 선택한 방법에 근거가 있는지, 그 근거가 맞는지를 직접 확인하려고 했습니다.',
            '가장 기억에 남는 건 모바일 확대 문제입니다. 사소해 보였지만, 사용자로서 먼저 불편을 느끼고 개발자로서 이유를 찾아 고치는 과정이 자연스럽게 이어진 첫 경험이었습니다.',
          ],
          callout: '동작하는 것과 자연스러운 것은 다르고, 그 차이는 코드만 봐서는 다 보이지 않았습니다.',
        },
      ],
    },
  },
  {
    slug: 'boostad',
    order: 2,
    name: 'BoostAD',
    period: '2025.12 – 2026.02',
    team: '4인 팀',
    title: '개발 블로그 글 내용에 맞는 광고를 붙이는 플랫폼',
    highlights: [
      ['첫 접속 파일 크기 ', { strong: '47% 감소' }, ', 로딩 빈 화면은 스켈레톤으로 대체'],
      ['실사용 피드백으로 광고 크기 선택·설치 안내 보완'],
      ['검색에 안 나오던 서비스를 ', { strong: '서비스명 검색 1위' }, '로'],
    ],
    thumbnail: { src: '/images/projects/boostad/thumb.webp', alt: 'BoostAD 캠페인 관리 화면' }, // 지금은 placeholder — TODO(세비): 실제 이미지로 교체
    links: { github: 'https://github.com/boostcampwm2025/web27-BoostAD' },
    // detail: TODO(세비) — 상세 원고 작성 전까지는 카드 클릭 시 GitHub로 이동
  },
  {
    slug: 'web-os-emulator',
    order: 3,
    name: 'Web OS Emulator',
    period: '2025.11 – 12',
    team: '4인 팀',
    title: '여러 사람이 동시에 쓰는 실시간 웹 OS',
    highlights: [
      ['넘겨받은 코드의 테스트 커버리지 ', { strong: '0% → 72%' }, ' (129개)'],
      ['바뀌면 안 되는 입출력부터 정해두고 리팩토링'],
    ],
    thumbnail: { src: '/images/projects/web-os-emulator/thumb.webp', alt: 'Web OS Emulator 데스크톱 화면' }, // 지금은 placeholder — TODO(세비): 실제 이미지로 교체
    links: { notion: 'https://hammerhead-knuckle-22a.notion.site/Web-OS-Emulator-38a1dbafa86880fab2b7db5b8078e729' },
    // detail: TODO(세비)
  },
  {
    slug: 'namota-igeota',
    order: 4,
    name: '나모타 이거타!',
    period: '2024.10 – 12',
    team: '2인 팀',
    title: '기후동행카드로 탈 수 있는 지하철 노선 안내',
    highlights: [
      ['와이어프레임·프로토타입 Figma로 직접 설계'],
      ['공공데이터를 가공해 ', { strong: '서비스 데이터 직접 구축' }],
      ['서경 SW아카데미 경진대회 ', { strong: '동상' }],
    ],
    thumbnail: { src: '/images/projects/namota-igeota/thumb.webp', alt: '나모타 이거타! 경로 안내 화면' }, // 지금은 placeholder — TODO(세비): 실제 이미지로 교체
    links: { github: 'https://github.com/2024-SW-Project/client' },
    // detail: TODO(세비)
  },
];
