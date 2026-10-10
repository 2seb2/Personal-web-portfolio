@AGENTS.md

# SEBI.dev — 이세비 프론트엔드 포트폴리오

공개 포트폴리오 사이트. 히어로의 키워드 인터랙션으로 "직접 써보고, 흐름이 끊기는 곳을 다듬는 개발자"를 보여준다.

## 먼저 읽을 문서
- `docs/hero-spec.md` — 홈 히어로 인터랙션 명세 (상태·입력·애니메이션·레이아웃·테스트). **히어로 작업 전 반드시 전체를 읽는다.**
- `docs/design-system.md` — 토큰·타이포·그림자·모서리·컴포넌트 규격
- `docs/figma-map.md` — Figma 화면·컴포넌트 node ID
- `docs/build-plan.md` — 작업 단계와 단계별 완료 기준

## 스택
- Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · Motion (`motion/react`) · next-themes
- 테스트: Vitest (단위, reducer·유틸) · Playwright (E2E)
- 배포: Vercel
- 패키지 매니저: npm
- 상태 관리 라이브러리 없음. 히어로 상태는 `useReducer`, 테마는 next-themes

## 폴더 구조
```
app/
  layout.tsx            폰트, ThemeProvider, Nav, Footer
  page.tsx              홈 (Hero)
  projects/page.tsx     프로젝트 목록
  projects/[slug]/page.tsx  프로젝트 상세 (generateStaticParams)
  articles/page.tsx     아티클 목록 (지금은 목데이터)
  (dev)/components/page.tsx 개발용 컴포넌트 확인 페이지 (프로덕션 빌드에서 404)
components/
  ui/                   KeywordPill, NavPill, Tag, ProjectCard, ThemeToggle, TidyButton
  layout/               Nav, Footer
  project/              상세 페이지 섹션 블록
features/hero/          Hero, Ring, Slot, reducer.ts, geometry.ts(링 좌표·충돌 계산), useDropTarget.ts
content/                site.ts, keywords.ts, projects.ts, articles.mock.ts
lib/                    getProjects(), getArticles() 등 데이터 함수
styles/tokens.css       디자인 토큰 (app/globals.css에서 import)
types/content.ts        콘텐츠 타입
e2e/                    Playwright 시나리오
```

## 명령어
- `npm run dev` / `npm run build` / `npm run lint` / `npm run typecheck` (`tsc --noEmit`)
- `npm test` (Vitest) / `npm run e2e` (Playwright)
- 작업을 끝냈다고 말하기 전에 `npm run typecheck && npm run lint && npm test`를 통과시킨다. 히어로를 건드렸으면 `npm run e2e`도.

## 규칙

### 디자인 토큰
- 색·글자 크기·행간·자간·그림자·모서리는 **`styles/tokens.css`에 정의된 것만** 쓴다. hex 값, 임의 px(`text-[17px]`, `bg-[#...]`) 금지.
- 예외: 히어로 링의 칩 좌표·회전처럼 계산된 값은 `style` 속성이나 CSS 변수로 넘긴다.
- 테마는 `<html data-theme>`의 CSS 변수만 바뀐다. 컴포넌트에서 테마 값을 읽어 분기하지 않는다. (`dark:` 접두사도 가능하면 쓰지 않는다 — 변수가 이미 바뀐다)
- 글자 스타일은 `type-*` 유틸리티로만 지정한다 (`docs/design-system.md` 표).

### 서버/클라이언트 경계
- 기본은 서버 컴포넌트. `'use client'`는 상호작용이 필요한 가장 작은 단위에만 (`features/hero/*`, `ThemeToggle`, 호버 애니메이션이 필요한 카드).
- 히어로의 첫 HTML(이름·기본 문구·힌트·모든 칩 라벨)은 서버에서 렌더링되어야 한다 (spec 9장).

### 콘텐츠
- 화면 문구는 컴포넌트에 직접 쓰지 않고 `content/*.ts`에서 가져온다.
- `content/` 파일의 문구는 사실 확인을 거친 원고다. **임의로 바꾸거나 다듬지 않는다.** 어색해 보여도 그대로 쓰고, 고칠 필요가 있으면 제안만 한다.
- `TODO(세비)` 주석이 있는 값은 임시 값이다. 그대로 써서 진행하고, 대신 채우거나 바꾸지 않는다.
- `public/images/`, `public/og.png`, `app/icon.png`, `app/apple-icon.png`는 회색 placeholder다. 지우지 말고 그대로 쓴다 (나중에 같은 파일명으로 교체됨).

### 접근성
- 모든 상호작용은 키보드로 가능해야 한다. 포커스 링을 지우지 않는다.
- `prefers-reduced-motion`을 존중한다 (spec 6장).
- 한글 줄바꿈은 `word-break: keep-all` (전역).
- viewport에 `maximum-scale`, `user-scalable=no`를 넣지 않는다 (확대 차단 금지).

### Git
- PR은 **큰 기능 단위**, 커밋은 그 안의 **작은 기능 단위**로 나눈다. 여러 기능을 한 커밋에 묶지 않는다.
- 커밋 메시지 형식 (본문 글머리표 **최소 2줄**):
  ```
  feat: 키워드 슬롯 드롭 판정 추가

  * 놓는 순간 포인터 좌표가 슬롯 영역(+16px) 안이면 슬롯에 넣기
  * 슬롯 밖에 놓으면 그 자리에 자유 배치
  ```
  접두사: `feat` `fix` `refactor` `test` `style` `chore` `docs`. 제목·본문 모두 한국어.
- **커밋·푸시·PR은 모두 사용자가 직접 한다. Claude Code는 `git add`, `git commit`, `git push`를 실행하지 않는다.**
- 대신 작은 기능 단위 작업이 끝날 때마다 응답 마지막에 **추천 커밋**을 남긴다:
  - 이번 커밋에 넣을 파일 목록 (커밋을 나누는 게 낫다면 커밋별로 나눠서)
  - 위 형식의 커밋 메시지 (복사해서 바로 쓸 수 있게 코드 블록으로)

### 작업 방식
- `docs/build-plan.md`의 단계 순서대로, 한 단계씩 진행한다. 다음 단계로 넘어가기 전에 그 단계의 완료 기준을 확인한다.
- Figma와 다르게 구현해야 할 이유가 생기면 구현하기 전에 먼저 알린다.
- spec에 없는 동작을 추가하지 않는다. 필요해 보이면 제안한다.

### 하지 말 것
- 상태 관리 라이브러리(Zustand, Redux 등) 추가
- CSS-in-JS(Emotion, styled-components) 추가
- 드래그 앤 드롭 라이브러리(dnd-kit 등) 추가 — Motion `drag` + 직접 판정 (spec 4장)
- 쿠키로 테마 저장 (정적 생성이 깨짐)
- 노션 API 연동 (아티클은 지금 목데이터. 후순위)
