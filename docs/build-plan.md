# Build Plan

한 단계씩 진행한다. 각 단계는 **Claude Code에 보낼 프롬프트 → 완료 기준 → 세비가 직접 확인할 것** 순서.
단계가 끝나면 직접 써보고, 끊기는 곳을 메모해 다음 단계 전에 고친다. (이 과정 자체가 포트폴리오의 이야기)

---

## 0단계 · 프로젝트 셋업

**프롬프트**
> CLAUDE.md와 docs/ 전체를 읽어줘. 이 프로젝트는 create-next-app(TypeScript, ESLint, Tailwind v4, App Router, src 없음, npm)으로 이미 만들어져 있어. tsconfig를 strict로 확인하고, motion, next-themes, Vitest, Playwright를 설치해줘. `styles/`, `content/`, `types/`, `docs/`, `CLAUDE.md`는 그대로 두고, `app/globals.css`의 기본 스타일은 지운 뒤 `styles/tokens.css`를 import해. `@/` 경로 별칭이 루트(`./*`)인지 확인해. 폰트는 Archivo(400·500·600·700·800), IBM Plex Mono(400·500)를 next/font/google로, 한글 대체용 Pretendard Variable은 `npm i pretendard` 후 next/font/local로 node_modules의 PretendardVariable.woff2를 불러와 넣고 tokens.css의 `--font-*` 변수와 연결해. next-themes는 spec 8장 설정 그대로. `typecheck`, `test`, `e2e` 스크립트도 추가해줘. 아직 화면은 만들지 마.

**완료 기준**
- `npm run dev`가 뜨고, 빈 페이지 배경이 OS 테마에 따라 `#FFFFFF` / `#1A1A1A`
- `npm run typecheck && npm run lint && npm test` 통과
- `<html>`에 `data-theme`, `suppressHydrationWarning`

**직접 확인**: OS 다크/라이트를 바꿔 새로고침했을 때 깜빡임이 없는지

---

## 1단계 · 공통 레이아웃과 UI 컴포넌트

**프롬프트**
> docs/design-system.md 5장과 Figma 컴포넌트(docs/figma-map.md)를 보고 `components/ui`에 KeywordPill, NavPill, Tag, ProjectCard, ThemeToggle, TidyButton을 만들어줘. 테마별로 나누지 말고 토큰만 써. 호버 상태와 전환 시간도 포함. 그리고 `components/layout`에 Nav(로고·Projects·Articles·이메일·ThemeToggle)와 Footer를 `content/site.ts` 문구로 만들어 layout.tsx에 넣어줘. 확인용으로 `app/(dev)/components/page.tsx`에 모든 컴포넌트를 상태별로 늘어놓고, 프로덕션 빌드에서는 404가 되게 해줘.

**완료 기준**
- `/components`에서 각 컴포넌트가 Figma와 같게 보임 (라이트·다크 모두)
- ThemeToggle로 바꾼 테마가 새로고침 후 유지, localStorage 키 `sebi-theme`
- Tab으로 모든 컴포넌트에 도달, 포커스 링 보임

**직접 확인**: Figma `v2 — Design System` 컴포넌트와 나란히 놓고 비교

---

## 2단계 · 정적 페이지

**프롬프트**
> `lib/`에 getProjects(), getProject(slug), getArticles()를 만들어줘 (지금은 content 파일을 그대로 돌려주고, 아티클은 나중에 노션으로 바꿀 수 있게). 그다음 /projects, /projects/[slug](generateStaticParams, detail이 있는 프로젝트만), /articles를 Figma 화면(140:353, 155:1088, 140:442)대로 만들어줘. detail이 없는 프로젝트 카드는 links.github → links.notion 순서로 새 탭 이동. 이미지 파일이 없으면 bg-sunken 빈 박스로 보여줘. 홈(/)은 Hero Copy의 Empty 상태만 정적으로, 링 칩은 아직 배치하지 마.

**완료 기준**
- `npm run build`가 모든 페이지를 정적 생성(○/●)으로 출력
- 상세 페이지의 모든 요소가 820 열 안에 있고 넘치는 글자 없음 (메타 4항목 포함)
- 상세의 "다음 프로젝트"가 다음 순서의 프로젝트로 연결

**직접 확인**: 1512 / 1024 / 768 / 390 폭에서 각 페이지를 끝까지 스크롤

---

## 3단계 · 히어로 인터랙션 (가장 중요 — 나눠서)

### 3-1. 상태와 링 배치
> docs/hero-spec.md를 처음부터 끝까지 읽어줘. `features/hero/reducer.ts`에 spec 3장 상태표를 그대로 reducer로 구현하고 Vitest로 표의 모든 행을 테스트해줘. `geometry.ts`에 spec 7장 링 좌표·비례·충돌 계산을 순수 함수로 만들고 768/900/1023/1512 폭에서 칩이 Hero Copy 블록과 겹치지 않는지 단위 테스트해줘. 아직 드래그는 하지 마.

### 3-2. 클릭·키보드·모바일
> 칩 클릭·Enter·Space로 슬롯에 넣기, 슬롯 안 칩 탭으로 리셋, 다른 칩으로 교체, Nav Pill의 Navigating(1.2초 후 이동, Hero Copy 클릭 시 즉시), aria-live 안내(spec 10장), 768px 미만 모바일 레이아웃(spec 7장)까지 구현해줘. Nav Pill은 `<a>`이고 JS가 없어도 이동해야 해.

### 3-3. 드래그와 자유 배치
> Motion drag로 spec 4장의 드롭 판정과 자유 배치·Esc 취소·화면 밖 보정·겹침 순서·칩 정리하기 버튼을 구현해줘. 위치는 비율로 저장하고, 슬롯은 항상 자유 배치 칩보다 위 레이어.

### 3-4. 애니메이션
> spec 6장 표대로 애니메이션을 넣어줘. 칩→슬롯은 layoutId, 서브 문구는 페이드+8px. prefers-reduced-motion이면 전부 즉시 전환.

**완료 기준 (3단계 전체)**
- reducer·geometry 단위 테스트 통과
- spec 0장 성공 기준 3개를 직접 확인
- 첫 HTML(JS 끔)에 이름·기본 문구·힌트·모든 칩 라벨이 있음

**직접 확인**: 개발하지 않는 지인 2~3명에게 설명 없이 써보게 하고 어디서 멈추는지 기록 (spec 0장)

---

## 4단계 · E2E 테스트

**프롬프트**
> docs/hero-spec.md 12장의 시나리오 #1~#21을 Playwright로 작성해줘. 데스크톱(1512), 모바일(390), reduced motion, 다크 컬러 스킴 프로젝트를 나눠서. 실패하는 시나리오는 테스트를 고치지 말고 구현을 고쳐줘.

**완료 기준**: `npm run e2e` 전부 통과

---

## 5단계 · SEO · 접근성 · 배포

**프롬프트**
> metadata(페이지별 title·description), Open Graph 이미지(public/og.png 사용), sitemap.ts, robots.ts, favicon을 넣어줘. Lighthouse(모바일)에서 Performance·Accessibility·SEO 90 이상을 목표로 문제를 고쳐줘. GitHub Actions에 PR마다 typecheck·lint·test·e2e를 돌리는 워크플로를 만들어줘. Vercel 배포는 내가 연결할 거야.

**완료 기준**
- Lighthouse 세 항목 90 이상, CLS 0에 가까움
- PR에서 CI가 돌고, 실패하면 머지 불가(브랜치 보호는 직접 설정)

**직접 확인**: Vercel 미리보기 주소를 실제 휴대폰으로 열어 써보기

---

## 6단계 · (후순위) 아티클 노션 연동
- getArticles() 내부만 노션 API로 교체, UI 변경 없음
- 노션 이미지 URL은 약 1시간 후 만료 → ISR(`revalidate`) 또는 빌드 시 이미지 저장 처리
- API 토큰은 Vercel 환경 변수
