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
> docs/build-plan.md 2단계를 진행해줘. 1단계 컴포넌트(ProjectCard, Tag, Nav, Footer 등)를 그대로 재사용해.
>
> 1. `lib/`에 getProjects(), getProject(slug), getArticles()를 만들어줘. 지금은 content 파일을 그대로 돌려주고, getArticles()는 나중에 노션 API로 내부만 바꿀 수 있게 반환 타입을 고정해.
> 2. /projects(Figma 140:353), /articles(140:442)를 Figma대로 만들어줘.
> 3. /projects/[slug]는 Figma 155:1088(라이트)·155:1271(다크)의 지켜줘홈즈 상세를 템플릿으로 삼아 만들어줘. 지금은 4개 프로젝트 모두 detail이 있으니 generateStaticParams로 detail이 있는 프로젝트를 전부 정적 생성해. 나머지 3개는 Figma 화면이 없으니 같은 템플릿과 같은 블록으로 렌더링하면 돼.
> 4. ProjectSection의 필드(paragraphs, blocks, image, callout, list, note)는 모두 선택이야. 있는 것만 렌더링하고, 없는 필드는 빈 요소나 여백을 남기지 마. 블록 라벨은 '발견·원인·판단·결과·문제·해결'이 섞여 있어. 순서는 데이터 순서 그대로 써.
> 5. "다음 프로젝트" 카드는 order 기준 다음 프로젝트로 연결하고, 마지막 프로젝트는 첫 번째로 순환해줘.
> 6. detail이 없는 프로젝트 카드는 links.github → links.notion 순서로 새 탭 이동 (`target="_blank" rel="noopener noreferrer"`). 지금은 해당 카드가 없지만 분기는 남겨 둬.
> 7. 이미지는 next/image로 width/height를 지정해 CLS가 없게 하고, 이미지를 불러오지 못하면 같은 크기의 bg-sunken 빈 박스로 보여줘.
> 8. 홈(/)은 Hero Copy의 Empty 상태만 정적으로 보여주고, 링 칩은 아직 배치하지 마.
> 9. content/의 문구와 `TODO(세비)`, `// 근거:` 주석은 수정하지 마.
>
> 작은 기능 단위가 끝날 때마다 추천 커밋을 남겨줘.

**완료 기준**
- `npm run build` 출력에서 /, /projects, /articles가 ○, /projects/[slug] 4개가 ●로 나옴
- 상세 4개 모두 모든 요소가 820 열 안에 있고 넘치는 글자가 없음. 메타 4항목, 특히 Web OS 스택(`Zustand · Socket.IO · Vitest`)이 넘치지 않는지 확인
- 인용 박스가 없는 섹션(Web OS 1·3번)에 빈 박스나 여백이 남지 않음
- 다음 프로젝트 순서가 01 → 02 → 03 → 04 → 01
- `npm run typecheck && npm run lint && npm test` 통과, PR에서 CI 통과

**직접 확인**
- 1512 / 1024 / 768 / 390 폭에서 각 페이지를 끝까지 스크롤
- 라이트와 다크를 둘 다 확인
- 상세 4개를 연달아 열어서, 지켜줘홈즈 말고 다른 프로젝트에서 구성이 어색해지는 곳이 없는지 보기. 거기서 나오는 원고 문제는 따로 메모해 두세요.

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

## 6단계 · (후순위) 아티클 자동화 (Notion → n8n → GitHub)
- 지금 아티클은 `content/articles/{id}.md` + `public/images/articles/{id}/`를 직접 올린다
- 자동화는 같은 형식의 파일을 만들어 커밋만 한다 — 사이트 코드(`lib/articles.ts`, 페이지)는 바꾸지 않음
- frontmatter 검증(`parseArticle`)이 빌드에서 형식 오류를 막는다
- 노션 이미지 URL은 약 1시간 후 만료 → 다운로드해 webp로 저장한 뒤 경로 교체
- '발행' 상태에서만 동기화, 처음엔 PR로 검토. 변환 못 한 블록은 동기화 실패로 처리
