# Figma Map

- 파일: `sebi_portfolio` · fileKey `7OFeMUbri2uMnaIoEgZzlT`
- 링크 형식: `https://www.figma.com/design/7OFeMUbri2uMnaIoEgZzlT/sebi_portfolio?node-id=<id에서 :를 -로>`
- **구현 기준은 v2 두 섹션뿐이다.** 같은 페이지의 `v1 — Pages`, `v1 — Design System`, `Archive 01~03`은 이전 시안·색 실험 기록이므로 참고하지 않는다.
- Figma MCP: 화면 구현 전 `get_design_context`(node ID)로 구조·수치를 확인하고, 결과는 그대로 붙이지 말고 이 저장소의 토큰·컴포넌트로 옮긴다. 시각 확인은 `get_screenshot`.

## 섹션
| 섹션 | node |
|---|---|
| v2 — Pages | `139:139` |
| v2 — Design System (문서 시트 + 원본 컴포넌트) | `156:1505` |

## 화면 — Desktop (1512 폭)
| 화면 | Light | Dark | 비고 |
|---|---|---|---|
| Home / Empty | `140:135` | `142:304` | 첫 화면 |
| Home / Keyword · 다시 써보는 | `140:179` | `142:326` | Filled 예시 |
| Home / Go Projects | `140:237` | `142:347` | Navigating, 링 숨김 |
| Home / Go Articles | `140:295` | `142:368` | Navigating |
| Home / Chips Moved | `166:1819` | `166:1876` | 자유 배치 + 칩 정리하기 |
| Projects | `140:353` | `142:389` | 목록 |
| Articles | `264:1881` | `264:2105` | 목록 — 가로형 카드 + 페이지네이션(8개씩) |
| Articles (이전 3열 격자, 참고용) | `140:442` | `142:475` | 더 이상 구현 기준 아님 |
| Project Detail (지켜줘홈즈) | `155:1088` | `155:1271` | 상세 |
| Article Detail (부스트캠프 챌린지 회고) | `237:1847` | `240:1864` | 상세, Markdown 본문 예시 |

### Keyword States (Filled, 키워드별)
| 키워드 | Light | Dark |
|---|---|---|
| E2E로 검증하는 | `142:1006` | `142:1723` |
| Bundle −47% | `142:1064` | `142:1781` |
| Coverage 0→72% | `142:1122` | `142:1839` |
| Feedback으로 다듬는 | `142:1180` | `142:1897` |
| 검색에 띄운 | `142:1238` | `142:1955` |
| 먼저 손 드는 | `142:1296` | `142:2013` |
| 낯선 도메인도 배우는 | `142:1354` | `142:2071` |
| AI에 기준을 주는 | `142:1412` | `142:2129` |

## 화면 — Mobile (390 폭)
| 화면 | Light | Dark |
|---|---|---|
| Home | `142:251` | `142:581` |

## 컴포넌트 (원본, `v2 — Design System` 안)
| 컴포넌트 | node | 속성 |
|---|---|---|
| Hero Copy | `113:2109` | Theme, State(Empty/Filled/Go Projects/Go Articles), Show Tidy |
| Keyword Pill | `124:31` | Theme, State(Default/Hover), Label |
| Nav Pill | `139:152` | Theme, State(Default/Hover), Label |
| Tag | `135:99` | Theme, Label |
| Project Card | `151:873` | Theme, State(Default/Hover) |
| Theme Toggle | `155:1087` | Theme |
| Tidy Button | `166:1665` | Theme, State(Default/Hover) |

## Figma와 코드가 다른 점 (의도된 차이)
- Figma는 칩 드래그를 "드래그 시작 = 화면 전환"으로만 흉내 낸다. 실제 동작은 `docs/hero-spec.md` 3·4장.
- Figma에는 타이핑 효과가 없다. 서브 문구 교체는 페이드 + 위로 8px (spec 6장).
- Figma의 상세 이미지 2장은 레퍼런스 사이트 캡처(placeholder). 코드에는 `content/projects.ts`의 경로를 쓰고, 파일이 없으면 `bg-sunken` 빈 박스로 렌더링.
- Figma의 한글은 대체 폰트로 표시된다. 코드는 Pretendard를 한글 대체 폰트로 쓴다.
