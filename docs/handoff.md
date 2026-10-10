# SEBI.dev 핸드오프 패키지

Claude Code로 포트폴리오 사이트를 만들기 위한 시작 파일 묶음.

## 사용법
Next 프로젝트(`sebi-portfolio/`)는 이미 만들어져 있다는 전제.

1. 이 패키지의 **내용물**을 프로젝트 폴더에 복사한다. `README.md`는 덮어쓴다. `.github`는 숨김 폴더라 Finder 복사 시 빠지기 쉬우니 터미널로:
   ```bash
   cp -R sebi-portfolio-handoff/. sebi-portfolio/
   ```
   `AGENTS.md`가 생성돼 있다면 그 안의 Next.js 안내는 남기고 이 패키지의 `CLAUDE.md` 내용을 합친다.
2. `.gitignore` 맨 아래에 추가한다:
   ```gitignore
   # Playwright
   /test-results/
   /playwright-report/
   /blob-report/
   /playwright/.cache/

   # 환경 변수 예시 파일은 올림 (노션 연동 때 필요)
   !.env.example

   # Claude Code 개인 설정
   .claude/settings.local.json
   CLAUDE.local.md

   # 에디터
   .idea/
   ```
3. Claude Code에 Figma MCP를 연결한다 (화면 수치를 직접 읽게 하려면 필요).
4. `docs/build-plan.md`의 0단계 프롬프트부터 하나씩 보낸다.

이미지와 문구에는 **임시 값이 이미 들어 있어서** 아래 준비물 없이도 끝까지 진행할 수 있다. 준비물은 나중에 같은 파일명으로 바꿔 끼우면 된다.

## Git 방식
- 커밋·푸시·PR은 **직접** 한다. Claude Code는 git 명령을 실행하지 않고, 작은 기능 단위가 끝날 때마다 **추천 커밋**(포함할 파일 + 메시지)을 남긴다 (`CLAUDE.md` Git 규칙).
- PR은 큰 기능 단위, 커밋은 작은 기능 단위.
- 커밋 메시지:
  ```
  feat: 제목

  * 구체적 서술
  * 구체적 서술 2
  ```
- PR 제목 `[Feat] 제목`, 본문은 `.github/pull_request_template.md`.

## 들어 있는 파일
| 파일 | 내용 |
|---|---|
| `CLAUDE.md` | Claude Code가 매번 읽는 규칙 (스택, 폴더 구조, 토큰 규칙, Git 규칙, 하지 말 것) |
| `docs/hero-spec.md` | 히어로 인터랙션 명세 v1.1 (상태·입력·자유 배치·애니메이션·레이아웃·테스트 21개·결정 로그) |
| `docs/design-system.md` | 색 토큰 16개, 글자 스타일 18개, 그림자·모서리, 레이아웃 수치, 컴포넌트 7종 규격 |
| `docs/figma-map.md` | Figma 화면·컴포넌트 node ID, Figma와 코드의 의도된 차이 |
| `docs/build-plan.md` | 0~6단계 작업 순서, 단계별 프롬프트와 완료 기준 |
| `.github/pull_request_template.md` | PR 본문 템플릿 (작업 개요 · 주요 변경 사항 · 기타 참고 사항) |
| `styles/tokens.css` | Tailwind v4용 토큰 (라이트/다크 CSS 변수 + `type-*` 글자 유틸리티) — 바로 import |
| `types/content.ts` | 콘텐츠 타입 |
| `content/site.ts` | 내비·히어로·페이지 제목·푸터 문구 |
| `content/keywords.ts` | 키워드 11개(문구·순서·기울기) + 링 기하값 |
| `content/projects.ts` | 프로젝트 4개 카드 + 지켜줘홈즈 상세 전문 |
| `content/articles.mock.ts` | 아티클 목데이터 6개 |
| `public/images/projects/**`, `public/og.png` | 회색 placeholder 이미지 (실제 크기) |
| `app/icon.png`, `app/apple-icon.png` | 임시 파비콘 (검정 바탕 주황 S) |

---

## 준비물 — 나중에 바꿔 끼울 것

### 1. 이미지
지금은 같은 이름·같은 크기의 회색 placeholder가 들어 있다. 실제 이미지를 **같은 파일명**으로 덮어쓰면 끝. WebP 권장, 크기는 화면 표시 크기의 2배.

| 파일 | 크기(2x) | 비율 | 내용 | 비고 |
|---|---|---|---|---|
| `jikyeojwo-homes/thumb.webp` | 890 × 704 | 약 1.26 : 1 | 목록 카드 썸네일 | |
| `boostad/thumb.webp` | 890 × 704 | 〃 | 〃 | |
| `web-os-emulator/thumb.webp` | 890 × 704 | 〃 | 〃 | |
| `namota-igeota/thumb.webp` | 890 × 704 | 〃 | 〃 | |
| `jikyeojwo-homes/hero.webp` | 1640 × 874 | 약 1.88 : 1 | 상세 대표 이미지 | 배포 전 반드시 교체 |
| `jikyeojwo-homes/flow.webp` | 1640 × 1006 | 약 1.63 : 1 | 상세 "서비스 흐름" 이미지 | 〃 |

선택: 노션의 지켜줘홈즈 GIF 3개(정보 입력·업로드 / AI 분석 / 결과 확인)를 쓰려면 GIF 대신 **MP4 + WebM으로 변환**하고 첫 프레임을 포스터 이미지(PNG)로 같이 둔다. GIF는 용량이 커서 성능 점수를 떨어뜨린다.

### 2. 사이트 공통 파일 (배포 전까지)
| 파일 | 크기 | 위치 |
|---|---|---|
| OG 이미지 (링크 공유 미리보기) | 1200 × 630 | `public/og.png` (placeholder 있음) |
| 파비콘 | 64 × 64 PNG 또는 SVG | `app/icon.png` (임시 있음) |
| 애플 터치 아이콘 | 180 × 180 PNG | `app/apple-icon.png` (임시 있음) |
| 이력서 PDF | — | `public/resume.pdf` (없으면 푸터 링크 404) |

### 3. 링크·계정
- [ ] LinkedIn 주소 — 없으면 `content/site.ts`에서 항목 삭제
- [ ] 블로그(티스토리) 주소를 푸터에 넣을지 결정
- [ ] Web OS Emulator 저장소 주소 (지금은 노션 링크)
- [ ] Vercel 계정 + GitHub 저장소 연결, 도메인(선택) → `content/site.ts`의 `url`
- [ ] (6단계) 노션 통합 토큰, 아티클 데이터베이스 ID

### 4. 콘텐츠 확정 (`TODO(세비)` 표시된 곳 — 지금은 임시 값, 급하지 않음)
- [ ] `projects.ts` — 지켜줘홈즈 Overview의 **75% 통계 출처**(기관·기준일)
- [ ] `projects.ts` — 4번 섹션 인용 박스 (임시 문장으로 바꿔 둠) 확정
- [ ] `projects.ts` — "서비스는 위와 같은 흐름입니다." 이미지 설명 문장 확정
- [ ] `projects.ts` — BoostAD·Web OS·나모타 이거타! **상세 원고** (없으면 카드가 GitHub/노션으로 연결됨)
- [ ] `keywords.ts` — 키워드별 `projectSlug`가 실제 출처와 맞는지
- [ ] `site.ts` — 저작권 문구, LinkedIn 링크(지금 `#`), 배포 주소(지금 localhost) 확정
- [ ] `articles.mock.ts` — 실제 글 제목·날짜·태그 (UI 확인용이라 급하지 않음)

### 5. 결정해 둔 것 (바꾸려면 시작 전에)
- 한글 폰트: **Pretendard Variable** — Archivo·IBM Plex Mono에는 한글이 없어서 대체 폰트가 필요. Google Fonts에 없으므로 `npm i pretendard`로 설치(0단계에서 Claude Code가 처리). Google Fonts로 바꾸려면 IBM Plex Sans KR 또는 Noto Sans KR로 `docs/design-system.md` 2장과 0단계 프롬프트 수정
- 패키지 매니저: **npm** (create-next-app을 npx로 실행)
