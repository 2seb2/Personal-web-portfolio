// 히어로 애니메이션 수치. spec 6장 표를 구현한다.

/**
 * Esc 복귀·정리 버튼·슬롯에서 빠진 칩의 Home 복귀, 슬롯 페이드 전환에 쓰는 spring (spec 6장).
 * 처음엔 stiffness 300을 썼는데, opacity 0→1·scale 0.95→1처럼 변화 폭이 작은 속성에는
 * 60~80ms 안에 체감상 다 끝나버려 "애니메이션 없이 바로 나타난다"고 느껴졌다 — stiffness를
 * 낮추고 damping 비율을 맞춰 눈에 보이는 시간(약 0.3~0.4s)으로 늘렸다.
 */
export const RETURN_SPRING = { type: 'spring' as const, stiffness: 170, damping: 22 };
/** 자유 배치 놓기 — 이동 없이 그 자리에서 살짝 안착만 (spec 6장) */
export const SETTLE_SPRING = { type: 'spring' as const, stiffness: 500, damping: 35 };
/** Ring 숨김(Navigating 진입) 페이드 (spec 6장) */
export const RING_HIDE_DURATION_S = 0.3;
/** Subcopy 교체 페이드/이동 각 구간 길이 (spec 6장) */
export const SUBCOPY_TRANSITION_DURATION_S = 0.25;
/** Subcopy 새 문구 등장 시 위로 이동하는 거리(px) (spec 6장) */
export const SUBCOPY_RISE_PX = 8;
/** 칩 호버 (spec 6장) */
export const CHIP_HOVER_TRANSITION = { duration: 0.18, ease: 'easeOut' as const };
/**
 * 슬롯 pill의 배경·글자색이 "채워지거나 빠지는" 모핑 길이(Empty↔Filled 전환에만 적용).
 * CSS transition-colors로 처리한다 — Motion의 backgroundColor/color 애니메이션은 테마 전환 시
 * inline style에 그 순간의 색이 고정되는 버그(KeywordPill/NavPill 참고)가 있어 피한다.
 */
export const SLOT_FILL_DURATION_S = 0.45;
