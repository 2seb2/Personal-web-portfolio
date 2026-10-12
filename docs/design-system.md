# Design System v2

Figma `v2 — Design System` 섹션(node `156:1505`)의 요약. 값은 `styles/tokens.css`에 이미 들어 있다.
**세부 수치(간격·패딩)는 Figma MCP `get_design_context`로 해당 node를 직접 확인**하고, 이 문서와 다르면 Figma를 따른다.

---

## 1. 색 토큰

| Figma 변수 | CSS 변수 | Tailwind | Light | Dark | 용도 |
|---|---|---|---|---|---|
| brand/orange | `--sebi-brand` | `brand` | #F49303 | #F49303 | 칩 호버 테두리, 태그, 슬롯 테두리 (면·선 전용) |
| brand/orange-text | `--sebi-brand-text` | `brand-text` | #BF5600 | #F49303 | 주황 글자 (이름, 강조 문구, 번호, 이메일, 라벨) |
| accent/selected | `--sebi-selected` | `selected` | #BF5600 | #F49303 | 슬롯에 들어간 키워드 배경 |
| text/on-selected | `--sebi-on-selected` | `on-selected` | #F5F5F2 | #141414 | 선택된 키워드 글자 |
| accent/handle | `--sebi-handle` | `handle` | #FFFFFF | #FFFFFF | 선택 핸들 4개 |
| bg/page | `--sebi-page` | `page` | #FFFFFF | #1A1A1A | 페이지 배경 |
| bg/surface | `--sebi-surface` | `surface` | #FFFFFF | #242424 | 칩, 아티클 카드, 토글 |
| bg/sunken | `--sebi-sunken` | `sunken` | #F4F4F5 | #2B2B2B | 썸네일 자리, 인용 박스 |
| bg/inverse | `--sebi-inverse` | `inverse` | #111111 | #F5F5F2 | Nav Pill, 토글 활성 칸 |
| text/primary | `--sebi-fg` | `fg` | #111111 | #F5F5F2 | 제목·본문 |
| text/strong | `--sebi-fg-strong` | `fg-strong` | #2A2A2A | #E2E2DE | 강조 본문, 인용 |
| text/secondary | `--sebi-fg-secondary` | `fg-secondary` | #666666 | #A3A3A0 | 보조 설명, 서브 문구 |
| text/muted | `--sebi-fg-muted` | `fg-muted` | #8E8E8E | #7A7A77 | 메타, 힌트, 저작권 |
| text/placeholder | `--sebi-fg-placeholder` | `fg-placeholder` | #ADADAD | #6B6B68 | 빈 슬롯 안내 |
| text/inverse | `--sebi-fg-inverse` | `fg-inverse` | #FFFFFF | #1A1A1A | Nav Pill 글자 |
| border/default | `--sebi-line` | `line` | #E8E8E8 | #363636 | 칩·카드·구분선 |

사용 예: `bg-surface text-fg border-line`, 반투명은 `bg-brand/12` (태그), `bg-brand/8` (프로젝트 카드 호버).

**대비 규칙**: 라이트에서 `brand`(#F49303)를 글자색으로 쓰지 않는다(흰 배경 대비 2.3:1). 글자는 항상 `brand-text`.

---

## 2. 타이포

폰트: **Archivo**(라틴) + **IBM Plex Mono**(라벨·메타) — `next/font/google`.
한글: Archivo·Plex Mono에 한글 글리프가 없어 **Pretendard Variable**을 대체 폰트로 둔다. Pretendard는 Google Fonts에 없으므로 `npm i pretendard`로 설치하고 `next/font/local`로 `node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`를 불러와 `--font-pretendard`에 연결한다(경로는 설치 후 확인). Figma 화면의 한글도 대체 폰트로 렌더링된 것.

| Figma 스타일 | 클래스 | 폰트 | 크기/행간 | 모바일(768px 미만) | 자간 | 쓰이는 곳 |
|---|---|---|---|---|---|---|
| display/lg | `type-display-lg` | Archivo 800 | 52/57 | 32/38 | −1.56 | 목록·상세 페이지 제목 |
| display/hero | `type-display-hero` | Archivo 500 | 48/82 | 30/41 | −1.44 | 히어로 "I'm", 꼬리말 |
| display/hero-strong | `type-display-hero-strong` | Archivo 800 | 48/82 | 30/41 | −1.44 | 히어로 "세비" |
| heading/slot | `type-heading-slot` | Archivo 700 | 30/51 | 18/27 | −0.6 | 슬롯 안 글자 |
| heading/lg | `type-heading-lg` | Archivo 700 | 26/44 | — | −0.52 | 푸터 제목·이메일 |
| lead | `type-lead` | Archivo 500 | 24/35 | 20/29 | −0.48 | 히어로 서브 문구 |
| heading/md | `type-heading-md` | Archivo 700 | 22/32 | 20/30 | −0.44 | 카드 제목, 상세 섹션 제목, 다음 프로젝트 |
| body/lg | `type-body-lg` | Archivo 400 | 19/32 | 17/28 | −0.16 | 페이지 설명, 상세 요약 |
| body/md | `type-body-md` | Archivo 400 | 16/27 | — | −0.16 | 상세 본문, 인용 |
| body/md-strong | `type-body-md-strong` | Archivo 700 | 16/27 | — | −0.16 | 발견·원인·판단·결과 라벨 |
| label/pill | `type-label-pill` | Archivo 600 | 16/28 | — | −0.16 | 키워드·이동 칩 |
| body/sm | `type-body-sm` | Archivo 400 | 14/24 | — | −0.16 | 카드 글머리표, 푸터 안내 |
| body/sm-medium | `type-body-sm-medium` | Archivo 500 | 14/24 | — | −0.16 | 내비 링크, 상세 메타 값 |
| body/sm-strong | `type-body-sm-strong` | Archivo 700 | 14/24 | — | −0.16 | 카드 글머리표 강조, 아티클 제목 |
| label/tag | `type-label-tag` | Archivo 500 | 12/16 | — | 0 | 태그 |
| mono/label | `type-mono-label` | Plex Mono 500 | 12/20 | — | 0.96 | 로고, 섹션 라벨 |
| mono/sm | `type-mono-sm` | Plex Mono 400 | 12/20 | — | 0 | 내비 이메일, 링크 |
| mono/xs | `type-mono-xs` | Plex Mono 400 | 11/19 | — | 0 | 히어로 Eyebrow·힌트, 카드 메타, 날짜, 정리 버튼 |

모바일 값은 `styles/tokens.css`의 각 `type-*` 유틸리티 안에 `@media (width < 48rem)`로 중첩되어 있어, 해당 클래스를 쓰는 모든 페이지에 동일하게 적용된다. 자간은 모바일에서도 그대로 유지(별도 값 없음).

---

## 3. 그림자 · 모서리

| 토큰 | 값 | 쓰이는 곳 |
|---|---|---|
| `shadow-sm` | 0 2 10 0 #16171B 7% | 기본 칩, 다크 호버 칩 |
| `shadow-md` | 0 8 22 0 #16171B 14% | 라이트 호버 칩, 프로젝트 카드 호버, Nav Pill 호버 |
| `rounded-pill` | 999 | 칩, 슬롯, 토글 |
| `rounded-card` | 14 | 썸네일, 아티클 카드 |
| `rounded-card-lg` | 24 | 프로젝트 카드 |
| `rounded-media` | 20 | 상세 대표 이미지 |
| `rounded-next` | 16 | 다음 프로젝트 카드 |
| `rounded-img` | 12 | 상세 본문 이미지 |

---

## 4. 레이아웃

| 항목 | 값 |
|---|---|
| 기준 화면 | 1512 × 982 |
| 모바일 경계 | 768px 미만 (`md`) |
| 내비 | 높이 57, 좌우 여백 56, 배경 `page` 85% + 하단 `line` 1px, 상단 고정 |
| 목록 페이지 본문 폭 | 968 (중앙) |
| 상세 페이지 열 폭 | 820 (중앙) — 제목·이미지·메타·본문·다음 프로젝트·푸터 내용 모두 같은 열 |
| 히어로 문구 블록 | 폭 846 고정, 화면 중앙 배치, 내부 좌측 정렬 |
| 히어로 링 | 중심 (756, 528) · 반지름 610 × 330 — 프레임(내비 포함) 기준, 화면 폭에 비례 |
| 프로젝트 그리드 | 2열, 카드 469 |
| 아티클 그리드 | 3열 |

---

## 5. 컴포넌트

모두 Theme(Light/Dark) 변형이 있지만, 코드에서는 **하나의 컴포넌트 + 토큰**으로 구현한다(테마별 컴포넌트 분리 금지).

| 컴포넌트 | Figma node | 상태 | 핵심 규격 |
|---|---|---|---|
| Keyword Pill | `124:31` | Default / Hover | `<button aria-pressed>`, 패딩 12·24, `rounded-pill`, 테두리 1.5 `line`, `bg-surface`, `type-label-pill text-fg`, `shadow-sm`. Hover: 테두리 `brand`, 라이트는 `shadow-md`. 0.18s |
| Nav Pill | `139:152` | Default / Hover | `<a href>`, `bg-inverse text-fg-inverse`, 라벨 + `→`, 간격 8. Hover: 간격 14(화살표가 벌어짐) + 테두리 1.5 `brand` + `shadow-md` |
| Tag | `135:99` | — | 패딩 4·8, `rounded-card`, `bg-brand/12`, 테두리 1 `brand`, `type-label-tag text-brand-text` |
| Project Card | `151:873` | Default / Hover | 폭 469, 패딩 12, `rounded-card-lg`. 썸네일 445×352 `rounded-card bg-sunken`. 메타 `type-mono-xs`(번호·이름 `brand-text`, 기간 `fg-muted`), 제목 `type-heading-md`, 글머리표 `type-body-sm`(강조 `type-body-sm-strong`). Hover: `bg-brand/8` + 테두리 1.5 `brand` + `shadow-md`, 0.2s. 크기 변화 없음(테두리는 inset) |
| Theme Toggle | `155:1087` | Light / Dark | 해·달 2칸, 칸 30×30 원형, 외곽 패딩 3·간격 2, `bg-surface` + 테두리 `line`. 활성 칸 `bg-inverse` + 아이콘 `fg-inverse`, 비활성 아이콘 `fg-secondary` |
| Tidy Button | `166:1665` | Default / Hover | ↺ 아이콘 12 + `칩 정리하기`, 간격 6, `type-mono-xs text-fg-secondary`. Hover: `brand-text` + 밑줄. 자유 배치된 칩이 있을 때만 Hint 오른쪽에 표시 |
| Hero Copy | `113:2109` | Empty / Filled / Go Projects / Go Articles, Show Tidy | 세로 간격 18. Eyebrow `type-mono-xs text-brand-text` → Headline(가로 간격 14: "I'm" `display-hero fg-secondary` + "세비" `display-hero-strong brand-text` + Slot + 꼬리말 `display-hero fg-secondary`) → Subcopy `type-lead fg-secondary`(강조 `brand-text`) → Hint Row(Hint `type-mono-xs fg-muted` + Tidy) |
| Slot (Hero 내부) | — | Empty / Over / Filled | Empty: 패딩 8·24, `rounded-pill`, 1.5 점선 `brand`, 글자 `type-heading-slot fg-placeholder`. 드래그 중 위: 실선 + scale 1.03. Filled: `bg-selected`, 글자 `on-selected`, 모서리 핸들 8×8(`bg-handle`, 테두리 1 `selected`, 각 꼭짓점 중심에 고정) |

### 상세 페이지 블록
- 섹션 제목: `type-heading-md`, 번호(`1.`)만 `brand-text`
- 라벨 문단: 라벨(`발견` 등) `type-body-md-strong text-brand-text` + 본문 `type-body-md text-fg-strong`
- 인용 박스: `bg-sunken`, 왼쪽 3px `brand` 선, `rounded-img`(오른쪽만), 패딩 20·24, `type-body-md text-fg-strong`
- 메타: 4개 항목 가로 배치 `justify-between`, 용어 `type-mono-xs fg-muted`, 값 `type-body-sm-medium fg` — **열 폭에 맞춰 줄바꿈, 넘치지 않음**
- 다음 프로젝트 카드: 열 폭 100%, `rounded-next`, 테두리 `line`, 라벨 `type-mono-sm brand-text`, 제목 `type-heading-md`
